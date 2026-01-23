import {type MockedObject, vi} from "vitest";
import type {ComponentFixture} from '@angular/core/testing';
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
  let mealPlanServiceSpy: MockedObject<Pick<MealPlanService, 'generate' | 'getHistory' | 'getById' | 'downloadPdf'>>;
  let recipeServiceSpy: MockedObject<Pick<RecipeService, 'getById'>>;
  let shoppingListServiceSpy: MockedObject<Pick<ShoppingListService, 'getShoppingList' | 'updateItemStatus' | 'downloadPdf'>>;
  let dietaryProfileServiceSpy: MockedObject<Pick<DietaryProfileService, 'getProfile'>>;
  let routerSpy: MockedObject<Pick<Router, 'navigate'>>;
  let routeParamMapSubject: ReplaySubject<ParamMap>;

  let mockProfile: DietaryProfileDto;
  let mockMealPlan: MealPlanDto;
  let mockShoppingList: ShoppingList;

  beforeEach(async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
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
    dietaryProfileServiceSpy.getProfile.mockReturnValue(of(mockProfile));
    mealPlanServiceSpy.getHistory.mockReturnValue(of([mockMealPlan]));
    shoppingListServiceSpy.getShoppingList.mockReturnValue(of(mockShoppingList));
  };

  const triggerNgOnInit = async (params: Params = {}): Promise<void> => {
    routeParamMapSubject.next(convertToParamMap(params));

    fixture.detectChanges();
    await fixture.whenStable();

    await Promise.resolve();
    fixture.detectChanges();
    await fixture.whenStable();
  };


  const initHappyPath = async (params: Params = {}): Promise<void> => {
    mockHappyPathServices();
    await triggerNgOnInit(params);
  };

  describe('ngOnInit', () => {
    it('ngOnInit_whenProfileMissing_shouldNavigateToDietaryProfileForm', async () => {
      dietaryProfileServiceSpy.getProfile.mockReturnValue(of(null));
      await triggerNgOnInit({});

      expect(dietaryProfileServiceSpy.getProfile).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/dietary-profile-form']);
    });

    it('ngOnInit_whenNoIdInRoute_shouldCallGetHistoryAndLoadLatestPlan', async () => {
      await initHappyPath();

      expect(mealPlanServiceSpy.getHistory).toHaveBeenCalled();
      expect(component.plan()).toEqual(mockMealPlan);
      expect(shoppingListServiceSpy.getShoppingList).toHaveBeenCalledWith(mockMealPlan.id);
    });

    it('ngOnInit_whenIdInRoute_shouldCallGetByIdAndLoadSpecificPlan', async () => {
      mealPlanServiceSpy.getById.mockReturnValue(of(mockMealPlan));
      await initHappyPath({id: '123'});

      expect(mealPlanServiceSpy.getById).toHaveBeenCalledWith(123);
      expect(component.plan()).toEqual(mockMealPlan);
    });
    it('ngOnInit_whenHistoryEmpty_shouldLeavePlanUnset', async () => {
      mealPlanServiceSpy.getHistory.mockReturnValue(of([]));
      dietaryProfileServiceSpy.getProfile.mockReturnValue(of(mockProfile));

      await triggerNgOnInit({});

      expect(component.plan()).toBeNull();
      expect(shoppingListServiceSpy.getShoppingList).not.toHaveBeenCalled();
    });
  });

  describe('onGenerate', () => {
    beforeEach(async () => {
      await initHappyPath();
    });

    it('onGenerate_whenCalled_shouldSetLoadingAndCallGenerateService', async () => {
      const newPlan = {...mockMealPlan, id: 456};
      mealPlanServiceSpy.generate.mockReturnValue(of(newPlan));
      shoppingListServiceSpy.getShoppingList.mockReturnValue(of(mockShoppingList));

      await component.onGenerate();

      expect(mealPlanServiceSpy.generate).toHaveBeenCalled();
      expect(component.plan()).toEqual(newPlan);
      expect(component.loading()).toBe(false);
    });

    it('onGenerate_whenServiceFails_shouldSetErrorMessageAndStopLoading', async () => {
      mealPlanServiceSpy.generate.mockReturnValue(throwError(() => new Error('Failed to generate meal plan')));

      await component.onGenerate();

      expect(component.errorMessage()).toContain('Failed to generate meal plan');
      expect(component.loading()).toBe(false);
    });

  });

  describe('selectDay', () => {
    beforeEach(async () => {
      await initHappyPath();
    });

    it('selectDay_whenCalledWithIndex_shouldUpdateSelectedDayIndex', () => {
      component.selectDay(1);
      expect(component.selectedDayIndex()).toBe(1);
    });
  });

  describe('onDownloadMealPlanPdf', () => {
    beforeEach(async () => {
      await initHappyPath();
    });

    it('onDownloadMealPlanPdf_whenCalledWithId_shouldCallDownloadPdfService', async () => {
      const mockBlob = new Blob(['pdf'], {type: 'application/pdf'});
      mealPlanServiceSpy.downloadPdf.mockReturnValue(of(mockBlob));

      await component.onDownloadMealPlanPdf(123);

      expect(mealPlanServiceSpy.downloadPdf).toHaveBeenCalledWith(123);
      expect(component.downloadingMealPlanPdf()).toBe(false);
    });

    it('onDownloadMealPlanPdf_whenServiceFails_shouldSetErrorMessageAndStopLoading', async () => {
      mealPlanServiceSpy.downloadPdf.mockReturnValue(throwError(() => new Error('Download failed')));

      await component.onDownloadMealPlanPdf(123);

      expect(component.errorMessage()).toContain('Download failed');
      expect(component.downloadingMealPlanPdf()).toBe(false);
    });
  });

  describe('onDownloadShoppingListPdf', () => {
    beforeEach(async () => {
      await initHappyPath();
    });

    it('onDownloadShoppingListPdf_whenServiceFails_shouldSetErrorMessageAndStopLoading', async () => {
      shoppingListServiceSpy.downloadPdf.mockReturnValue(throwError(() => new Error('Download failed')));

      await component.onDownloadShoppingListPdf(123);

      expect(component.errorMessage()).toContain('Download failed');
      expect(component.downloadingShoppingListPdf()).toBe(false);
    });
  });

  describe('onToggleShoppingListItem', () => {
    beforeEach(async () => {
      await initHappyPath();
    });

    it('onToggleShoppingListItem_whenServiceFails_shouldRollbackAndSetError', async () => {
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

      shoppingListServiceSpy.updateItemStatus.mockReturnValue(throwError(() => new Error('Update failed')));

      const payload = {ingredientName: 'Apple', isBought: true};
      await component.onToggleShoppingListItem(payload);

      expect(component.shoppingList()).toEqual(initialList);
      expect(component.errorMessage()).toContain('Update failed');
      expect(component.updatingShoppingListItemId()).toBeNull();
    });
  });

  describe('onToggleRecipe', () => {
    beforeEach(async () => {
      await initHappyPath();
    });

    it('onToggleRecipe_whenDetailsMissing_shouldFetchAndExpand', async () => {
      const recipeId = 101;
      const mockRecipe = createMockRecipe({id: recipeId, name: 'Test Recipe'});
      recipeServiceSpy.getById.mockReturnValue(of(mockRecipe));

      await component.onToggleRecipe(recipeId);

      expect(component.expandedRecipeIds().has(recipeId)).toBe(true);
      expect(recipeServiceSpy.getById).toHaveBeenCalledWith(recipeId);
      expect(component.recipeDetails().get(recipeId)).toEqual(mockRecipe);
    });

    it('onToggleRecipe_whenAlreadyExpanded_shouldCollapseWithoutRefetch', async () => {
      const recipeId = 101;
      component.expandedRecipeIds.set(new Set([recipeId]));
      component.recipeDetails.set(new Map([[recipeId, createMockRecipe({id: recipeId})]]));

      await component.onToggleRecipe(recipeId);

      expect(component.expandedRecipeIds().has(recipeId)).toBe(false);
      expect(recipeServiceSpy.getById).not.toHaveBeenCalled();
    });
  });

});
