import type {ComponentFixture} from '@angular/core/testing';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {of, throwError} from 'rxjs';

import {MealPlanHistoryComponent} from './mealplan-history.component';
import {MealPlanService} from '@core/services/mealplan/mealplan.service';
import {createMockMealPlan} from '@testing/test-data.util';
import {provideRouter} from '@angular/router';

describe('MealPlanHistoryComponent', () => {
  let component: MealPlanHistoryComponent;
  let fixture: ComponentFixture<MealPlanHistoryComponent>;
  let mealPlanServiceSpy: jasmine.SpyObj<MealPlanService>;

  beforeEach(async () => {
    mealPlanServiceSpy = jasmine.createSpyObj('MealPlanService', ['getHistory']);
    mealPlanServiceSpy.getHistory.and.returnValue(of([]));

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

  it('history_whenLoaded_shouldExposeMealPlans', fakeAsync(() => {
    const plan = createMockMealPlan({id: 10});
    mealPlanServiceSpy.getHistory.and.returnValue(of([plan]));

    createComponent();
    tick();

    expect(component.loading()).toBeFalse();
    expect(component.mealPlans()).toEqual([plan]);
    expect(component.errorMessage()).toBeNull();
  }));

  it('history_whenLoadFails_shouldExposeErrorMessage', fakeAsync(() => {
    mealPlanServiceSpy.getHistory.and.returnValue(
      throwError(() => new Error('Network error'))
    );

    createComponent();
    tick();

    expect(component.loading()).toBeFalse();
    expect(component.mealPlans()).toEqual([]);
    expect(component.errorMessage()).toBe('Failed to load meal plan history.');
  }));
});
