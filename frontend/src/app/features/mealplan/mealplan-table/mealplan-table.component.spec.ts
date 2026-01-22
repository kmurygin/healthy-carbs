import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';

import {MealPlanTableComponent} from './mealplan-table.component';
import type {MealPlanDto} from '@core/models/dto/mealplan.dto';
import {MealPlanSource} from '@core/models/enum/mealplan-source.enum';
import {createMockMealPlan, createMockMealPlanDay} from '@testing/test-data.util';

describe('MealPlanTableComponent', () => {
  let component: MealPlanTableComponent;
  let fixture: ComponentFixture<MealPlanTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealPlanTableComponent],
      providers: [provideRouter([])]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MealPlanTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('mealPlans', []);
    fixture.detectChanges();
  });

  it('component_whenCreated_shouldBeTruthy', () => {
    expect(component).toBeTruthy();
  });

  it('rows_whenMealPlansProvided_shouldSortAndAverageTotals', () => {
    const olderPlan: MealPlanDto = createMockMealPlan({
      id: 1,
      createdAt: '2026-01-01',
      days: [createMockMealPlanDay(), createMockMealPlanDay({id: 2})],
      totalCalories: 2000,
      totalCarbs: 300,
      totalProtein: 100,
      totalFat: 80,
      source: MealPlanSource.GENERATED
    });
    const newerPlan: MealPlanDto = createMockMealPlan({
      id: 2,
      createdAt: '2026-01-05',
      days: [createMockMealPlanDay()],
      totalCalories: 1800,
      totalCarbs: 200,
      totalProtein: 120,
      totalFat: 60,
      source: MealPlanSource.DIETITIAN
    });

    fixture.componentRef.setInput('mealPlans', [olderPlan, newerPlan]);
    fixture.detectChanges();

    const rows = component.rows();
    expect(rows.length).toBe(2);
    expect(rows[0].id).toBe(newerPlan.id);
    expect(rows[1].id).toBe(olderPlan.id);
    expect(rows[1].daysCount).toBe(2);
    expect(rows[1].total.calories).toBe(1000);
  });
});
