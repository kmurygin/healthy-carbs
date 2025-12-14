import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';

import {MealPlanInfoComponent} from './meal-plan-info.component';

describe('MealPlanInfoComponent', () => {
  let component: MealPlanInfoComponent;
  let fixture: ComponentFixture<MealPlanInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealPlanInfoComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MealPlanInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
