import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';

import {DashboardDailyTotalsComponent} from './dashboard-daily-totals.component';

describe('DashboardDailyTotalsComponent', () => {
  let component: DashboardDailyTotalsComponent;
  let fixture: ComponentFixture<DashboardDailyTotalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardDailyTotalsComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardDailyTotalsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('dailyTotals', {calories: 0, carbs: 0, protein: 0, fat: 0});
    fixture.componentRef.setInput('dailyTargets', {calories: 0, carbs: 0, protein: 0, fat: 0});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
