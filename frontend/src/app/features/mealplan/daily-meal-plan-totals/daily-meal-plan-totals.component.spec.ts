import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';

import {DailyMealPlanTotalsComponent} from './daily-meal-plan-totals.component';

describe('DailyMealPlanTotalsComponent', () => {
  let component: DailyMealPlanTotalsComponent;
  let fixture: ComponentFixture<DailyMealPlanTotalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyMealPlanTotalsComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DailyMealPlanTotalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate percentages correctly', () => {
    fixture.componentRef.setInput('dailyTotals', {
      calories: 1000, carbs: 100, protein: 50, fat: 30
    });
    fixture.componentRef.setInput('dailyTargets', {
      calories: 2000, carbs: 200, protein: 100, fat: 60
    });
    fixture.detectChanges();

    const percents = component.percents();
    expect(percents.calories).toBe(50);
    expect(percents.carbs).toBe(50);
    expect(percents.protein).toBe(50);
    expect(percents.fat).toBe(50);
  });

  it('should restrict progress bar values to 0-100', () => {
    fixture.componentRef.setInput('dailyTotals', {
      calories: 3000, carbs: -10, protein: 50, fat: 30
    });
    fixture.componentRef.setInput('dailyTargets', {
      calories: 2000, carbs: 200, protein: 100, fat: 60
    });
    fixture.detectChanges();

    const progress = component.progressBarPercents();
    expect(progress.calories).toBe(100);
    expect(progress.carbs).toBe(0);
  });

  it('should handle zero division/targets gracefully', () => {
    fixture.componentRef.setInput('dailyTotals', {
      calories: 100, carbs: 100, protein: 100, fat: 100
    });
    fixture.componentRef.setInput('dailyTargets', {
      calories: 0, carbs: 0, protein: 0, fat: 0
    });
    fixture.detectChanges();

    const percents = component.percents();
    expect(percents.calories).toBe(0);
  });
});
