import type {ComponentFixture} from '@angular/core/testing';
import {fakeAsync, tick} from '@angular/core/testing';
import type {MealPlanComponent} from './mealplan.component';
import type {MealPlanService} from '@core/services/mealplan/mealplan.service';
import type {RecipeService} from '@core/services/recipe/recipe.service';
import type {ShoppingListService} from '@core/services/shopping-list/shopping-list.service';
import type {DietaryProfileService} from '@core/services/dietary-profile/dietary-profile.service';
import type {ParamMap, Params, Router} from '@angular/router';
import {convertToParamMap} from '@angular/router';
import type {ReplaySubject} from 'rxjs';
import {of, throwError} from 'rxjs';
import type {MealPlanDto} from '@core/models/dto/mealplan.dto';
import type {DietaryProfileDto} from '@core/models/dto/dietaryprofile.dto';
import type {ShoppingList} from '@core/models/dto/shopping-list.dto';
import {IngredientCategory} from '@core/models/enum/ingredient-category.enum';
import {
  createMockMealPlan,
  createMockMealPlanDay,
  createMockRecipe,
  createMockShoppingList,
  REGULAR_TEST_USER
} from '@testing/test-data.util';
import {setupMealPlanComponentTest} from '@testing/mealplan-component-test.util';

describe('MealPlanComponent', () => {
  let component: MealPlanComponent;
  let fixture: ComponentFixture<MealPlanComponent>;
  let mealPlanServiceSpy: jasmine.SpyObj<MealPlanService>;
  let recipeServiceSpy: jasmine.SpyObj<RecipeService>;
  let shoppingListServiceSpy: jasmine.SpyObj<ShoppingListService>;
  let dietaryProfileServiceSpy: jasmine.SpyObj<DietaryProfileService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let routeParamMapSubject: ReplaySubject<ParamMap>;

  let mockProfile: DietaryProfileDto;
  let mockMealPlan: MealPlanDto;
  let mockShoppingList: ShoppingList;

  beforeEach(async () => {
    spyOn(console, 'error').and.stub();
    mockProfile = {
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
    mockMealPlan = createMockMealPlan({
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
    const baseShoppingItems = createMockShoppingList().items;
    const mockShoppingItems: ShoppingList['items'] = {
      ...baseShoppingItems,
      [IngredientCategory.FRUITS]: [
        {name: 'Apple', totalQuantity: 2, unit: 'pcs', isBought: false}
      ]
    };
    mockShoppingList = {items: mockShoppingItems};

    const setup = await setupMealPlanComponentTest();

    fixture = setup.fixture;
    component = setup.component;
    routeParamMapSubject = setup.routeParamMapSubject;
    routerSpy = setup.routerSpy;
    mealPlanServiceSpy = setup.mealPlanServiceSpy;
    recipeServiceSpy = setup.recipeServiceSpy;
    shoppingListServiceSpy = setup.shoppingListServiceSpy;
    dietaryProfileServiceSpy = setup.dietaryProfileServiceSpy;
  });

  afterEach(() => {
    routeParamMapSubject.complete();
  });

  const mockHappyPathServices = (): void => {
    dietaryProfileServiceSpy.getProfile.and.returnValue(of(mockProfile));
    mealPlanServiceSpy.getHistory.and.returnValue(of([mockMealPlan]));
    shoppingListServiceSpy.getShoppingList.and.returnValue(of(mockShoppingList));
  };

  const triggerNgOnInit = (params: Params = {}): void => {
    routeParamMapSubject.next(convertToParamMap(params));
    fixture.detectChanges();
  };

  const initHappyPath = (params: Params = {}): void => {
    mockHappyPathServices();
    triggerNgOnInit(params);
  };

  describe('ngOnInit', () => {
    it('ngOnInit_whenProfileMissing_shouldNavigateToDietaryProfileForm', fakeAsync(() => {
      dietaryProfileServiceSpy.getProfile.and.returnValue(of(null));
      triggerNgOnInit({});
      tick();

      expect(dietaryProfileServiceSpy.getProfile).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/dietary-profile-form']);
    }));

    it('ngOnInit_whenNoIdInRoute_shouldCallGetHistoryAndLoadLatestPlan', fakeAsync(() => {
      initHappyPath();
      tick();

      expect(mealPlanServiceSpy.getHistory).toHaveBeenCalled();
      expect(component.plan()).toEqual(mockMealPlan);
      expect(shoppingListServiceSpy.getShoppingList).toHaveBeenCalledWith(mockMealPlan.id);
    }));

    it('ngOnInit_whenIdInRoute_shouldCallGetByIdAndLoadSpecificPlan', fakeAsync(() => {
      mealPlanServiceSpy.getById.and.returnValue(of(mockMealPlan));
      initHappyPath({id: '123'});
      tick();

      expect(mealPlanServiceSpy.getById).toHaveBeenCalledWith(123);
      expect(component.plan()).toEqual(mockMealPlan);
    }));
    it('ngOnInit_whenHistoryEmpty_shouldLeavePlanUnset', fakeAsync(() => {
      mealPlanServiceSpy.getHistory.and.returnValue(of([]));
      dietaryProfileServiceSpy.getProfile.and.returnValue(of(mockProfile));

      triggerNgOnInit({});
      tick();

      expect(component.plan()).toBeNull();
      expect(shoppingListServiceSpy.getShoppingList).not.toHaveBeenCalled();
    }));
  });

  describe('onGenerate', () => {
    beforeEach(() => {
      initHappyPath();
    });

    it('onGenerate_whenCalled_shouldSetLoadingAndCallGenerateService', fakeAsync(() => {
      const newPlan = {...mockMealPlan, id: 456};
      mealPlanServiceSpy.generate.and.returnValue(of(newPlan));
      shoppingListServiceSpy.getShoppingList.and.returnValue(of(mockShoppingList));

      void component.onGenerate();
      expect(component.loading()).toBeTrue();

      tick();

      expect(mealPlanServiceSpy.generate).toHaveBeenCalled();
      expect(component.plan()).toEqual(newPlan);
      expect(component.loading()).toBeFalse();
    }));

    it('onGenerate_whenServiceFails_shouldSetErrorMessageAndStopLoading', fakeAsync(() => {
      mealPlanServiceSpy.generate.and.returnValue(throwError(() => new Error('Failed to generate meal plan')));

      void component.onGenerate();
      tick();

      expect(component.errorMessage()).toContain('Failed to generate meal plan');
      expect(component.loading()).toBeFalse();
    }));

  });

  describe('selectDay', () => {
    beforeEach(() => {
      initHappyPath();
    });

    it('selectDay_whenCalledWithIndex_shouldUpdateSelectedDayIndex', () => {
      component.selectDay(1);
      expect(component.selectedDayIndex()).toBe(1);
    });
  });

  describe('onDownloadMealPlanPdf', () => {
    beforeEach(() => {
      initHappyPath();
    });

    it('onDownloadMealPlanPdf_whenCalledWithId_shouldCallDownloadPdfService', fakeAsync(() => {
      const mockBlob = new Blob(['pdf'], {type: 'application/pdf'});
      mealPlanServiceSpy.downloadPdf.and.returnValue(of(mockBlob));

      void component.onDownloadMealPlanPdf(123);
      expect(component.downloadingMealPlanPdf()).toBeTrue();

      tick();

      expect(mealPlanServiceSpy.downloadPdf).toHaveBeenCalledWith(123);
      expect(component.downloadingMealPlanPdf()).toBeFalse();
    }));

    it('onDownloadMealPlanPdf_whenServiceFails_shouldSetErrorMessageAndStopLoading', fakeAsync(() => {
      mealPlanServiceSpy.downloadPdf.and.returnValue(throwError(() => new Error('Download failed')));

      void component.onDownloadMealPlanPdf(123);
      tick();

      expect(component.errorMessage()).toContain('Download failed');
      expect(component.downloadingMealPlanPdf()).toBeFalse();
    }));
  });

  describe('onDownloadShoppingListPdf', () => {
    beforeEach(() => {
      initHappyPath();
    });

    it('onDownloadShoppingListPdf_whenServiceFails_shouldSetErrorMessageAndStopLoading', fakeAsync(() => {
      shoppingListServiceSpy.downloadPdf.and.returnValue(throwError(() => new Error('Download failed')));

      void component.onDownloadShoppingListPdf(123);
      tick();

      expect(component.errorMessage()).toContain('Download failed');
      expect(component.downloadingShoppingListPdf()).toBeFalse();
    }));
  });

  describe('onToggleShoppingListItem', () => {
    beforeEach(() => {
      initHappyPath();
    });

    it('onToggleShoppingListItem_whenServiceFails_shouldRollbackAndSetError', fakeAsync(() => {
      const baseShoppingItems = createMockShoppingList().items;
      const initialShoppingItems: ShoppingList['items'] = {
        ...baseShoppingItems,
        [IngredientCategory.FRUITS]: [
          {name: 'Apple', totalQuantity: 2, unit: 'pcs', isBought: false}
        ]
      };
      const initialList: ShoppingList = {items: initialShoppingItems};
      component.plan.set(mockMealPlan);
      component.shoppingList.set(initialList);

      shoppingListServiceSpy.updateItemStatus.and.returnValue(throwError(() => new Error('Update failed')));

      const payload = {ingredientName: 'Apple', isBought: true};
      void component.onToggleShoppingListItem(payload);
      tick();

      expect(component.shoppingList()).toEqual(initialList);
      expect(component.errorMessage()).toContain('Update failed');
      expect(component.updatingShoppingListItemId()).toBeNull();
    }));
  });

  describe('onToggleRecipe', () => {
    beforeEach(() => {
      initHappyPath();
    });

    it('onToggleRecipe_whenDetailsMissing_shouldFetchAndExpand', fakeAsync(() => {
      const recipeId = 101;
      const mockRecipe = createMockRecipe({id: recipeId, name: 'Test Recipe'});
      recipeServiceSpy.getById.and.returnValue(of(mockRecipe));

      void component.onToggleRecipe(recipeId);
      tick();

      expect(component.expandedRecipeIds().has(recipeId)).toBeTrue();
      expect(recipeServiceSpy.getById).toHaveBeenCalledWith(recipeId);
      expect(component.recipeDetails().get(recipeId)).toEqual(mockRecipe);
    }));

    it('onToggleRecipe_whenAlreadyExpanded_shouldCollapseWithoutRefetch', fakeAsync(() => {
      const recipeId = 101;
      component.expandedRecipeIds.set(new Set([recipeId]));
      component.recipeDetails.set(new Map([[recipeId, createMockRecipe({id: recipeId})]]));

      void component.onToggleRecipe(recipeId);
      tick();

      expect(component.expandedRecipeIds().has(recipeId)).toBeFalse();
      expect(recipeServiceSpy.getById).not.toHaveBeenCalled();
    }));
  });

});
