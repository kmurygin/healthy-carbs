import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';

import {MealPlanHistoryComponent} from './mealplan-history.component';

describe('MealplanHistoryComponent', () => {
  let component: MealPlanHistoryComponent;
  let fixture: ComponentFixture<MealPlanHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealPlanHistoryComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MealPlanHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
