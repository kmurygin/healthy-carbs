import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';

import {MealPlanHistoryItemComponent} from './meal-plan-history-item.component';
import {MealType} from '@core/models/enum/meal-type.enum';
import type {MealPlanDayDto} from '@core/models/dto/mealplan-day.dto';
import {createMockRecipe} from '@testing/test-data.util';

describe('MealPlanHistoryItemComponent', () => {
  let component: MealPlanHistoryItemComponent;
  let fixture: ComponentFixture<MealPlanHistoryItemComponent>;

  let mealPlanDay: MealPlanDayDto;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealPlanHistoryItemComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MealPlanHistoryItemComponent);
    component = fixture.componentInstance;
    mealPlanDay = {
      id: 1,
      dayOfWeek: 'MONDAY',
      date: '2026-01-01',
      recipes: [
        {id: 1, mealType: MealType.DINNER, recipe: createMockRecipe({id: 10})},
        {id: 2, mealType: MealType.BREAKFAST, recipe: createMockRecipe({id: 11})}
      ],
      totalCalories: 500.4,
      totalCarbs: 50.2,
      totalProtein: 30.6,
      totalFat: 20.1
    };
    fixture.componentRef.setInput('mealPlanDay', mealPlanDay);
    fixture.detectChanges();
  });

  it('component_whenCreated_shouldBeTruthy', () => {
    expect(component).toBeTruthy();
  });

  it('dayTotals_whenComputed_shouldRoundMacros', () => {
    const totals = component.dayTotals();
    expect(totals.calories).toBe(500);
    expect(totals.carbs).toBe(50);
    expect(totals.protein).toBe(31);
    expect(totals.fat).toBe(20);
  });

  it('groupedByMealType_whenComputed_shouldSortMealTypes', () => {
    const groups = component.groupedByMealType();
    expect(groups.length).toBe(2);
    expect(groups[0].mealType).toBe(MealType.BREAKFAST);
    expect(groups[1].mealType).toBe(MealType.DINNER);
  });

  it('toggleExpanded_whenCalled_shouldFlipState', () => {
    expect(component.isExpanded()).toBeFalse();
    component.toggleExpanded();
    expect(component.isExpanded()).toBeTrue();
  });
});
