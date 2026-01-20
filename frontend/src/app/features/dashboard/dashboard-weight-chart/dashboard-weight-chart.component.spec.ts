import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';

import {DashboardWeightChartComponent} from './dashboard-weight-chart.component';

describe('DashboardWeightChartComponent', () => {
  let component: DashboardWeightChartComponent;
  let fixture: ComponentFixture<DashboardWeightChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardWeightChartComponent],
      providers: [provideRouter([])]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardWeightChartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('weightHistory', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
