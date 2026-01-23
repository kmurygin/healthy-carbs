import type {MockedObject} from "vitest";
import type {ComponentFixture} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import type {MealPlanComponent} from './mealplan.component';
import type {DebugElement} from '@angular/core';
import type {ParamMap} from '@angular/router';
import {convertToParamMap} from '@angular/router';
import type {ReplaySubject} from 'rxjs';
import {of} from 'rxjs';
import type {ShoppingList} from '@core/models/dto/shopping-list.dto';
import type {MealPlanDto} from '@core/models/dto/mealplan.dto';
import type {MealPlanDayDto} from '@core/models/dto/mealplan-day.dto';
import type {MealPlanService} from '@core/services/mealplan/mealplan.service';
import type {ShoppingListService} from '@core/services/shopping-list/shopping-list.service';
import {
  createMockDietaryProfile,
  createMockMealPlan,
  createMockMealPlanDay,
  createMockShoppingList,
  REGULAR_TEST_USER
} from '@testing/test-data.util';
import {setupMealPlanComponentTest} from '@testing/mealplan-component-test.util';
import {IngredientCategory} from '@core/models/enum/ingredient-category.enum';

describe('MealPlanComponent DOM Integration', () => {
  let component: MealPlanComponent;
  let fixture: ComponentFixture<MealPlanComponent>;
  let mealPlanServiceSpy: MockedObject<Pick<MealPlanService, 'generate' | 'getHistory' | 'getById' | 'downloadPdf'>>;
  let shoppingListServiceSpy: MockedObject<Pick<ShoppingListService, 'getShoppingList' | 'downloadPdf'>>;
  let routeParamMapSubject: ReplaySubject<ParamMap>;

  let mockMealPlan: MealPlanDto;
  let mockShoppingList: ShoppingList;

  beforeEach(async () => {
    mockMealPlan = createMockMealPlan({
      id: 123,
      days: [createMockMealPlanDay({id: 1})]
    });
    const baseShoppingItems = createMockShoppingList().items;
    const mockShoppingItems: ShoppingList['items'] = {
      ...baseShoppingItems,
      [IngredientCategory.FRUITS]: [{name: 'Apple', totalQuantity: 1, unit: 'kg', isBought: false}]
    };
    mockShoppingList = {items: mockShoppingItems};

    const setup = await setupMealPlanComponentTest();

    fixture = setup.fixture;
    component = setup.component;
    routeParamMapSubject = setup.routeParamMapSubject;
    mealPlanServiceSpy = setup.mealPlanServiceSpy;
    shoppingListServiceSpy = setup.shoppingListServiceSpy;

    const mockProfile = createMockDietaryProfile({user: REGULAR_TEST_USER});
    setup.dietaryProfileServiceSpy.getProfile.mockReturnValue(of(mockProfile));
    mealPlanServiceSpy.getHistory.mockReturnValue(of([]));
    mealPlanServiceSpy.getById.mockReturnValue(of(mockMealPlan));
    mealPlanServiceSpy.generate.mockReturnValue(of(mockMealPlan));
    mealPlanServiceSpy.downloadPdf.mockReturnValue(of(new Blob([''], {type: 'application/pdf'})));
    shoppingListServiceSpy.getShoppingList.mockReturnValue(of(mockShoppingList));
    shoppingListServiceSpy.downloadPdf.mockReturnValue(of(new Blob([''], {type: 'application/pdf'})));
  });

  const getByTestId = (testId: string): DebugElement | null => {
    return fixture.debugElement.query(By.css(`[data-testid="${testId}"]`));
  };

  const setupLoadedState = () => {
    component.loading.set(false);
    component.plan.set(mockMealPlan);
    component.shoppingList.set(mockShoppingList);
    component.errorMessage.set(null);
    fixture.detectChanges();
  };

  const triggerInit = async (params: Record<string, string> = {}): Promise<void> => {
    routeParamMapSubject.next(convertToParamMap(params));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    for (let attempts = 0; attempts < 3 && component.loading(); attempts += 1) {
      await fixture.whenStable();
      fixture.detectChanges();
    }
  };

  describe('Loading & Error States', () => {
    it('template_whenLoading_shouldShowLoadingMessage', () => {
      component.loading.set(true);
      fixture.detectChanges();

      expect(getByTestId('loading-message')).toBeTruthy();
      expect(getByTestId('daily-totals')).toBeNull();
    });

    it('template_whenErrorMessagePresent_shouldShowError', () => {
      component.loading.set(false);
      component.errorMessage.set('Test Error');
      fixture.detectChanges();

      const errorEl = getByTestId('error-message');
      expect(errorEl).toBeTruthy();
      const errorText = (errorEl?.nativeElement as HTMLElement | null)?.textContent ?? '';
      expect(errorText).toContain('Test Error');
    });
  });

  describe('Content Rendering', () => {
    beforeEach(setupLoadedState);

    it('template_whenPlanLoaded_shouldRenderMainSections', () => {
      expect(getByTestId('daily-totals')).toBeTruthy();
      expect(getByTestId('shopping-list')).toBeTruthy();
      expect(getByTestId('btn-generate')).toBeTruthy();
      expect(getByTestId('btn-download-shopping-list')).toBeTruthy();
      expect(getByTestId('btn-download-meal-plan')).toBeTruthy();
    });

    it('template_whenPlanLoaded_shouldRenderDayTabs', () => {
      mockMealPlan.days.forEach((day: MealPlanDayDto, index: number) => {
        const tab = getByTestId(`day-tab-${index}`);
        expect(tab).toBeTruthy();
      });
    });
  });

  describe('Interactions', () => {
    beforeEach(setupLoadedState);

    it('selectDay_whenTabClicked_shouldUpdateSelectedDay', () => {
      const dayIndex = 0;
      const tab = getByTestId(`day-tab-${dayIndex}`);

      expect(tab).toBeTruthy();
      tab!.triggerEventHandler('click', null);
      fixture.detectChanges();

      expect(component.selectedDayIndex()).toBe(dayIndex);
      const tabElement = tab?.nativeElement as HTMLElement | null;
      expect(tabElement?.getAttribute('aria-selected')).toBe('true');
    });

    it('downloadMealPlan_whenButtonClicked_shouldCallService', () => {
      const btn = getByTestId('btn-download-meal-plan');
      expect(btn).toBeTruthy();

      btn!.triggerEventHandler('click', null);

      expect(mealPlanServiceSpy.downloadPdf).toHaveBeenCalledWith(mockMealPlan.id);
    });

    it('downloadShoppingList_whenButtonClicked_shouldCallService', () => {
      const btn = getByTestId('btn-download-shopping-list');
      expect(btn).toBeTruthy();

      btn!.triggerEventHandler('click', null);

      expect(shoppingListServiceSpy.downloadPdf).toHaveBeenCalledWith(mockMealPlan.id);
    });
  });

  it('route_whenIdProvided_shouldLoadPlanAndRender', async () => {
    mealPlanServiceSpy.getById.mockReturnValue(of(mockMealPlan));
    shoppingListServiceSpy.getShoppingList.mockReturnValue(of(mockShoppingList));

    await triggerInit({id: '123'});
    fixture.detectChanges();

    expect(mealPlanServiceSpy.getById).toHaveBeenCalledWith(123);
    expect(getByTestId('daily-totals')).toBeTruthy();
    expect(getByTestId('shopping-list')).toBeTruthy();
  });

  describe('Pagination Interactions', () => {
    const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;
    const buildTwoWeekPlan = () => createMockMealPlan({
      days: Array.from({length: 14}, (_, dayIndex) => createMockMealPlanDay({
        id: dayIndex + 1,
        dayOfWeek: daysOfWeek[dayIndex % daysOfWeek.length]
      }))
    });

    it('nextWeek_whenClicked_shouldShowNextWeekDays', () => {
      const twoWeekPlan = buildTwoWeekPlan();
      component.plan.set(twoWeekPlan);
      component.loading.set(false);
      fixture.detectChanges();

      const nextBtn = fixture.debugElement.query(By.css('button[aria-label="Next week"]'));
      expect(nextBtn).toBeTruthy();
      nextBtn.triggerEventHandler('click', null);
      fixture.detectChanges();

      expect(component.currentWeekIndex()).toBe(1);
      expect(getByTestId('day-tab-7')).toBeTruthy();
    });

    it('nextWeek_whenAtLastWeek_shouldNotAdvance', () => {
      const twoWeekPlan = buildTwoWeekPlan();
      component.plan.set(twoWeekPlan);
      component.loading.set(false);
      component.currentWeekIndex.set(1);
      fixture.detectChanges();

      const nextBtn = fixture.debugElement.query(By.css('button[aria-label="Next week"]'));
      expect(nextBtn).toBeTruthy();
      expect(nextBtn.nativeElement).toBeTruthy();

      nextBtn.triggerEventHandler('click', null);
      fixture.detectChanges();

      expect(component.currentWeekIndex()).toBe(1);
    });
  });
});
