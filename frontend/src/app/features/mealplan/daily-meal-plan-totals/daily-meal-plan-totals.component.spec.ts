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
});
