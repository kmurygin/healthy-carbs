import {type MockedObject, vi} from "vitest";
import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';
import {of, throwError} from 'rxjs';

import {MealPlanHistoryComponent} from './mealplan-history.component';
import {MealPlanService} from '@core/services/mealplan/mealplan.service';
import {createMockMealPlan} from '@testing/test-data.util';
import {provideRouter} from '@angular/router';

describe('MealPlanHistoryComponent', () => {
  let component: MealPlanHistoryComponent;
  let fixture: ComponentFixture<MealPlanHistoryComponent>;
  let mealPlanServiceSpy: MockedObject<Pick<MealPlanService, 'getHistory'>>;

  beforeEach(async () => {
    mealPlanServiceSpy = {
      getHistory: vi.fn().mockName("MealPlanService.getHistory")
    };
    mealPlanServiceSpy.getHistory.mockReturnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [MealPlanHistoryComponent],
      providers: [
        {provide: MealPlanService, useValue: mealPlanServiceSpy},
        provideRouter([]),
      ]
    })
      .compileComponents();
  });

  const createComponent = (): void => {
    fixture = TestBed.createComponent(MealPlanHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  it('component_whenCreated_shouldBeTruthy', () => {
    createComponent();
    expect(component).toBeTruthy();
  });

  it('history_whenLoaded_shouldExposeMealPlans', () => {
    const plan = createMockMealPlan({id: 10});
    mealPlanServiceSpy.getHistory.mockReturnValue(of([plan]));

    createComponent();

    expect(component.loading()).toBe(false);
    expect(component.mealPlans()).toEqual([plan]);
    expect(component.errorMessage()).toBeNull();
  });

  it('history_whenLoadFails_shouldExposeErrorMessage', () => {
    mealPlanServiceSpy.getHistory.mockReturnValue(throwError(() => new Error('Network error')));

    createComponent();

    expect(component.loading()).toBe(false);
    expect(component.mealPlans()).toEqual([]);
    expect(component.errorMessage()).toBe('Failed to load meal plan history.');
  });
});
