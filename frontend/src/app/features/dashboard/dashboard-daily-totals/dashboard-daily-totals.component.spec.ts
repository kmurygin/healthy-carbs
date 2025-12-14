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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
