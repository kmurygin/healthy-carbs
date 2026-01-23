import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';
import type {ParamMap} from '@angular/router';
import {ActivatedRoute, Router} from '@angular/router';
import type {MockedObject} from 'vitest';
import {of, ReplaySubject} from 'rxjs';
import {vi} from 'vitest'

import {MealPlanComponent} from '@features/mealplan/mealplan/mealplan.component';
import {MealPlanService} from '@core/services/mealplan/mealplan.service';
import {RecipeService} from '@core/services/recipe/recipe.service';
import {ShoppingListService} from '@core/services/shopping-list/shopping-list.service';
import {DietaryProfileService} from '@core/services/dietary-profile/dietary-profile.service';
import {
  createMockDietaryProfile,
  createMockMealPlan,
  createMockRecipe,
  createMockShoppingList
} from '@testing/test-data.util';

type RouterSpy = MockedObject<Pick<Router, 'navigate'>>;
type MealPlanServiceSpy = MockedObject<Pick<MealPlanService, 'generate' | 'getHistory' | 'getById' | 'downloadPdf'>>;
type RecipeServiceSpy = MockedObject<Pick<RecipeService, 'getById'>>;
type ShoppingListServiceSpy = MockedObject<Pick<ShoppingListService, 'getShoppingList' | 'updateItemStatus' | 'downloadPdf'>>;
type DietaryProfileServiceSpy = MockedObject<Pick<DietaryProfileService, 'getProfile'>>;

interface MealPlanComponentTestSetup {
  fixture: ComponentFixture<MealPlanComponent>;
  component: MealPlanComponent;
  routeParamMapSubject: ReplaySubject<ParamMap>;
  routerSpy: RouterSpy;
  mealPlanServiceSpy: MealPlanServiceSpy;
  recipeServiceSpy: RecipeServiceSpy;
  shoppingListServiceSpy: ShoppingListServiceSpy;
  dietaryProfileServiceSpy: DietaryProfileServiceSpy;
}

export async function setupMealPlanComponentTest(): Promise<MealPlanComponentTestSetup> {
  const routerSpy: RouterSpy = {
    navigate: vi.fn(),
  };
  const routeParamMapSubject = new ReplaySubject<ParamMap>(1);
  const mealPlanServiceSpy: MealPlanServiceSpy = {
    generate: vi.fn(),
    getHistory: vi.fn(),
    getById: vi.fn(),
    downloadPdf: vi.fn(),
  };
  const recipeServiceSpy: RecipeServiceSpy = {
    getById: vi.fn(),
  };
  const shoppingListServiceSpy: ShoppingListServiceSpy = {
    getShoppingList: vi.fn(),
    updateItemStatus: vi.fn(),
    downloadPdf: vi.fn(),
  };
  const dietaryProfileServiceSpy: DietaryProfileServiceSpy = {
    getProfile: vi.fn(),
  };

  mealPlanServiceSpy.getHistory.mockImplementation(() => of([]));
  mealPlanServiceSpy.getById.mockImplementation(() => of(createMockMealPlan()));
  mealPlanServiceSpy.generate.mockImplementation(() => of(createMockMealPlan()));
  mealPlanServiceSpy.downloadPdf.mockImplementation(
    () => of(new Blob([''], {type: 'application/pdf'}))
  );

  recipeServiceSpy.getById.mockImplementation(() => of(createMockRecipe()));
  shoppingListServiceSpy.getShoppingList.mockImplementation(() => of(createMockShoppingList()));
  shoppingListServiceSpy.updateItemStatus.mockImplementation(() => of(null));
  shoppingListServiceSpy.downloadPdf.mockImplementation(
    () => of(new Blob([''], {type: 'application/pdf'}))
  );
  dietaryProfileServiceSpy.getProfile.mockImplementation(() => of(createMockDietaryProfile()));

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
