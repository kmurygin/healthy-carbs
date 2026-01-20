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
    fixture.componentRef.setInput('total', 0);
    fixture.componentRef.setInput('target', 100);
    fixture.componentRef.setInput('percent', 0);
    fixture.componentRef.setInput('unit', 'g');
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('iconClasses', 'fa-solid fa-test');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
