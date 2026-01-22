import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';
import type {ParamMap} from '@angular/router';
import {ActivatedRoute, Router} from '@angular/router';
import {of, ReplaySubject} from 'rxjs';

import {MealPlanComponent} from '@features/mealplan/mealplan/mealplan.component';
import {MealPlanService} from '@core/services/mealplan/mealplan.service';
import {RecipeService} from '@core/services/recipe/recipe.service';
import {ShoppingListService} from '@core/services/shopping-list/shopping-list.service';
import {DietaryProfileService} from '@core/services/dietary-profile/dietary-profile.service';
import {createMockDietaryProfile, createMockMealPlan, createMockRecipe, createMockShoppingList} from '@testing/test-data.util';

interface MealPlanComponentTestSetup {
  fixture: ComponentFixture<MealPlanComponent>;
  component: MealPlanComponent;
  routeParamMapSubject: ReplaySubject<ParamMap>;
  routerSpy: jasmine.SpyObj<Router>;
  mealPlanServiceSpy: jasmine.SpyObj<MealPlanService>;
  recipeServiceSpy: jasmine.SpyObj<RecipeService>;
  shoppingListServiceSpy: jasmine.SpyObj<ShoppingListService>;
  dietaryProfileServiceSpy: jasmine.SpyObj<DietaryProfileService>;
}

export async function setupMealPlanComponentTest(): Promise<MealPlanComponentTestSetup> {
  const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
  const routeParamMapSubject = new ReplaySubject<ParamMap>(1);
  const mealPlanServiceSpy = jasmine.createSpyObj<MealPlanService>(
    'MealPlanService',
    ['generate', 'getHistory', 'getById', 'downloadPdf']
  );
  const recipeServiceSpy = jasmine.createSpyObj<RecipeService>('RecipeService', ['getById']);
  const shoppingListServiceSpy = jasmine.createSpyObj<ShoppingListService>(
    'ShoppingListService',
    ['getShoppingList', 'updateItemStatus', 'downloadPdf']
  );
  const dietaryProfileServiceSpy = jasmine.createSpyObj<DietaryProfileService>(
    'DietaryProfileService',
    ['getProfile']
  );

  mealPlanServiceSpy.getHistory.and.callFake(() => of([]));
  mealPlanServiceSpy.getById.and.callFake(() => of(createMockMealPlan()));
  mealPlanServiceSpy.generate.and.callFake(() => of(createMockMealPlan()));
  mealPlanServiceSpy.downloadPdf.and.callFake(
    () => of(new Blob([''], {type: 'application/pdf'}))
  );

  recipeServiceSpy.getById.and.callFake(() => of(createMockRecipe()));
  shoppingListServiceSpy.getShoppingList.and.callFake(() => of(createMockShoppingList()));
  shoppingListServiceSpy.updateItemStatus.and.callFake(() => of(null));
  shoppingListServiceSpy.downloadPdf.and.callFake(
    () => of(new Blob([''], {type: 'application/pdf'}))
  );
  dietaryProfileServiceSpy.getProfile.and.callFake(() => of(createMockDietaryProfile()));

  await TestBed.configureTestingModule({
    imports: [MealPlanComponent],
    providers: [
      {provide: MealPlanService, useValue: mealPlanServiceSpy},
      {provide: RecipeService, useValue: recipeServiceSpy},
      {provide: ShoppingListService, useValue: shoppingListServiceSpy},
      {provide: DietaryProfileService, useValue: dietaryProfileServiceSpy},
      {provide: Router, useValue: routerSpy},
      {provide: ActivatedRoute, useValue: {paramMap: routeParamMapSubject.asObservable()}},
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(MealPlanComponent);
  const component = fixture.componentInstance;

  return {
    fixture,
    component,
    routeParamMapSubject,
    routerSpy,
    mealPlanServiceSpy,
    recipeServiceSpy,
    shoppingListServiceSpy,
    dietaryProfileServiceSpy,
  };
}
