import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';

import {DashboardNutrientTotalComponent} from './dashboard-nutrient-total.component';

describe('DashboardNutrientTotalComponent', () => {
  let component: DashboardNutrientTotalComponent;
  let fixture: ComponentFixture<DashboardNutrientTotalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardNutrientTotalComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardNutrientTotalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
