import type {ComponentFixture} from '@angular/core/testing';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';

import {MealPlanComponent} from './mealplan.component';
import {MealPlanService} from '@core/services/mealplan/mealplan.service';
import {RecipeService} from '@core/services/recipe/recipe.service';
import {ShoppingListService} from '@core/services/shopping-list/shopping-list.service';
import {DietaryProfileService} from '@core/services/dietary-profile/dietary-profile.service';
import {ActivatedRoute, convertToParamMap, Router} from '@angular/router';
import {of, Subject, throwError} from 'rxjs';
import type {MealPlanDto} from '@core/models/dto/mealplan.dto';
import type {DietaryProfileDto} from '@core/models/dto/dietaryprofile.dto';
import type {ShoppingList} from '@core/models/dto/shopping-list.dto';
import {IngredientCategory} from "@core/models/enum/ingredient-category.enum";
import {createMockMealPlan, createMockMealPlanDay, REGULAR_TEST_USER} from '@testing/test-data.util';

describe('MealPlanComponent', () => {
  let component: MealPlanComponent;
  let fixture: ComponentFixture<MealPlanComponent>;
  let mealPlanServiceSpy: jasmine.SpyObj<MealPlanService>;
  let recipeServiceSpy: jasmine.SpyObj<RecipeService>;
  let shoppingListServiceSpy: jasmine.SpyObj<ShoppingListService>;
  let dietaryProfileServiceSpy: jasmine.SpyObj<DietaryProfileService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let routeParamMapSubject: Subject<any>;

  const mockProfile: DietaryProfileDto = {
    id: 1,
    user: REGULAR_TEST_USER,
    calorieTarget: 2000,
    proteinTarget: 150,
    fatTarget: 70,
    carbsTarget: 200,
    weight: 70,
    height: 175,
    age: 30,
    gender: 'MALE',
    dietGoal: 'MAINTENANCE',
    dietType: 'BALANCED',
    activityLevel: 'MODERATE'
  };

  const mockMealPlan: MealPlanDto = createMockMealPlan({
    id: 123,
    days: [createMockMealPlanDay({
      id: 1,
      totalCalories: 500,
      totalCarbs: 50,
      totalProtein: 30,
      totalFat: 20
    })],
    totalCalories: 500,
    totalCarbs: 50,
    totalProtein: 30,
    totalFat: 20
  });

  const mockShoppingList: ShoppingList = {
    items: {
      [IngredientCategory.FRUITS]: [
        {name: 'Apple', totalQuantity: 2, unit: 'pcs', isBought: false}
      ]
    } as any
  };

  beforeEach(async () => {
    mealPlanServiceSpy = jasmine.createSpyObj(
      'MealPlanService',
      ['generate', 'getHistory', 'getById', 'downloadPdf']
    );
    recipeServiceSpy = jasmine.createSpyObj(
      'RecipeService',
      ['getById']
    );
    shoppingListServiceSpy = jasmine.createSpyObj(
      'ShoppingListService',
      ['getShoppingList', 'updateItemStatus', 'downloadPdf']
    );
    dietaryProfileServiceSpy = jasmine.createSpyObj(
      'DietaryProfileService',
      ['getProfile']
    );
    routerSpy = jasmine.createSpyObj(
      'Router',
      ['navigate']
    );
    routeParamMapSubject = new Subject();

    await TestBed.configureTestingModule({
      imports: [MealPlanComponent],
      providers: [
        {provide: MealPlanService, useValue: mealPlanServiceSpy},
        {provide: RecipeService, useValue: recipeServiceSpy},
        {provide: ShoppingListService, useValue: shoppingListServiceSpy},
        {provide: DietaryProfileService, useValue: dietaryProfileServiceSpy},
        {provide: Router, useValue: routerSpy},
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: routeParamMapSubject.asObservable()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MealPlanComponent);
    component = fixture.componentInstance;
  });

  describe('Initialization', () => {
    it('should redirect if dietary profile missing', fakeAsync(() => {
      dietaryProfileServiceSpy.getProfile.and.returnValue(of(null));
      routeParamMapSubject.next(convertToParamMap({}));

      fixture.detectChanges();
      tick();

      expect(dietaryProfileServiceSpy.getProfile).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/dietary-profile-form']);
    }));

    it('should load latest plan if no ID in route', fakeAsync(() => {
      dietaryProfileServiceSpy.getProfile.and.returnValue(of(mockProfile));
      mealPlanServiceSpy.getHistory.and.returnValue(of([mockMealPlan]));
      shoppingListServiceSpy.getShoppingList.and.returnValue(of(mockShoppingList));

      routeParamMapSubject.next(convertToParamMap({}));
      fixture.detectChanges();
      tick();

      expect(mealPlanServiceSpy.getHistory).toHaveBeenCalled();
      expect(component.plan()).toEqual(mockMealPlan);
      expect(shoppingListServiceSpy.getShoppingList).toHaveBeenCalledWith(mockMealPlan.id);
    }));

    it('should load specific plan if ID in route', fakeAsync(() => {
      dietaryProfileServiceSpy.getProfile.and.returnValue(of(mockProfile));
      mealPlanServiceSpy.getById.and.returnValue(of(mockMealPlan));
      shoppingListServiceSpy.getShoppingList.and.returnValue(of(mockShoppingList));

      routeParamMapSubject.next(convertToParamMap({id: '123'}));
      fixture.detectChanges();
      tick();

      expect(mealPlanServiceSpy.getById).toHaveBeenCalledWith(123);
      expect(component.plan()).toEqual(mockMealPlan);
    }));
  });

  describe('User Interactions', () => {
    beforeEach(() => {
      dietaryProfileServiceSpy.getProfile.and.returnValue(of(mockProfile));
      mealPlanServiceSpy.getHistory.and.returnValue(of([mockMealPlan]));
      shoppingListServiceSpy.getShoppingList.and.returnValue(of(mockShoppingList));
      routeParamMapSubject.next(convertToParamMap({}));
      fixture.detectChanges();
    });

    it('should generate new meal plan', fakeAsync(() => {
      const newPlan = {...mockMealPlan, id: 456};
      mealPlanServiceSpy.generate.and.returnValue(of(newPlan));
      shoppingListServiceSpy.getShoppingList.and.returnValue(of(mockShoppingList));

      component.onGenerate();
      expect(component.loading()).toBeTrue();

      tick();

      expect(mealPlanServiceSpy.generate).toHaveBeenCalled();
      expect(component.plan()).toEqual(newPlan);
      expect(component.loading()).toBeFalse();
    }));

    it('should handle generate error', fakeAsync(() => {
      mealPlanServiceSpy.generate.and.returnValue(throwError(() => {
        new Error('Failed to generate meal plan')
      }));

      component.onGenerate();
      tick();

      expect(component.errorMessage()).toContain('Failed to generate meal plan');
      expect(component.loading()).toBeFalse();
    }));

    it('should select a day', () => {
      component.selectDay(1);
      expect(component.selectedDayIndex()).toBe(1);
    });

    it('should download meal plan PDF', fakeAsync(() => {
      const mockBlob = new Blob(['pdf'], {type: 'application/pdf'});
      mealPlanServiceSpy.downloadPdf.and.returnValue(of(mockBlob));

      component.onDownloadMealPlanPdf(123);
      expect(component.downloadingMealPlanPdf()).toBeTrue();

      tick();

      expect(mealPlanServiceSpy.downloadPdf).toHaveBeenCalledWith(123);
      expect(component.downloadingMealPlanPdf()).toBeFalse();
    }));
  });
});
