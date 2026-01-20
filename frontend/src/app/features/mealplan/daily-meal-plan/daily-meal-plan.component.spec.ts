import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';

import {DailyMealPlanComponent} from './daily-meal-plan.component';
import type {MealPlanDayDto} from '@core/models/dto/mealplan-day.dto';
import {MealType} from "@core/models/enum/meal-type.enum";
import {createMockRecipe} from '@testing/test-data.util';

describe('DailyMealPlanComponent', () => {
  let component: DailyMealPlanComponent;
  let fixture: ComponentFixture<DailyMealPlanComponent>;

  const mockMealPlanDay: MealPlanDayDto = {
    id: 1,
    dayOfWeek: 'MONDAY',
    date: '2026-01-01',
    recipes: [
      {id: 10, mealType: MealType.BREAKFAST, recipe: createMockRecipe({id: 100})},
      {id: 11, mealType: MealType.LUNCH, recipe: createMockRecipe({id: 101})},
      {id: 12, mealType: MealType.BREAKFAST, recipe: createMockRecipe({id: 102})}
    ],
    totalCalories: 2000,
    totalCarbs: 250,
    totalProtein: 150,
    totalFat: 70
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyMealPlanComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DailyMealPlanComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('dailyPlan', mockMealPlanDay);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should group recipes by meal type', () => {
    const groups = component.groupedByMealType();
    expect(groups.length).toBe(2);

    const breakfastGroup = groups.find(group => group.mealType === 'BREAKFAST');
    const lunchGroup = groups.find(group => group.mealType === 'LUNCH');

    expect(breakfastGroup).toBeDefined();
    expect(breakfastGroup?.items.length).toBe(2);

    expect(lunchGroup).toBeDefined();
    expect(lunchGroup?.items.length).toBe(1);
  });

  it('should return empty groups if no plan', () => {
    fixture.componentRef.setInput('dailyPlan', null);
    fixture.detectChanges();
    expect(component.groupedByMealType()).toEqual([]);
  });

  it('should emit toggleRecipe event', () => {
    spyOn(component.toggleRecipe, 'emit');
    component.onToggleRecipe(123);
    expect(component.toggleRecipe.emit).toHaveBeenCalledWith(123);
  });
});
