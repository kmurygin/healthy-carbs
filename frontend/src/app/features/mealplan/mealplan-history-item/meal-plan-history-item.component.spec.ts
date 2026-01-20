import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';

import {MealPlanHistoryItemComponent} from './meal-plan-history-item.component';

describe('MealplanHistoryItemComponent', () => {
  let component: MealPlanHistoryItemComponent;
  let fixture: ComponentFixture<MealPlanHistoryItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealPlanHistoryItemComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MealPlanHistoryItemComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('mealPlanDay', {
      id: 1,
      dayOfWeek: 'MONDAY',
      date: '2026-01-01',
      recipes: [],
      totalCalories: 500,
      totalCarbs: 50,
      totalProtein: 30,
      totalFat: 20
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
