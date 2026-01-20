import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';

import {NutrientTotalComponent} from './nutrient-total.component';

describe('NutrientTotalComponent', () => {
  let component: NutrientTotalComponent;
  let fixture: ComponentFixture<NutrientTotalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NutrientTotalComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(NutrientTotalComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('total', 50);
    fixture.componentRef.setInput('target', 100);
    fixture.componentRef.setInput('percent', 50);
    fixture.componentRef.setInput('progressBarPercent', 50);
    fixture.componentRef.setInput('unit', 'g');
    fixture.componentRef.setInput('label', 'Protein');
    fixture.componentRef.setInput('iconClasses', 'fa-solid fa-drumstick-bite');
    fixture.componentRef.setInput('barColorClass', 'bg-blue-500');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
