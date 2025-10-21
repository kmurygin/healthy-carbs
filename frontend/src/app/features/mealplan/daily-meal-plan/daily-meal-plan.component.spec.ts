import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';

import {DailyMealPlanComponent} from './daily-meal-plan.component';

describe('DailyMealPlanComponent', () => {
  let component: DailyMealPlanComponent;
  let fixture: ComponentFixture<DailyMealPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyMealPlanComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DailyMealPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
