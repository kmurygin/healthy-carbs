import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';

import {MealPlanHistoryItemComponent} from './meal-plan-history-item.component';

describe('MealplanHistoryItemComponent', () => {
  let component: MealPlanHistoryItemComponent;
  let fixture: ComponentFixture<MealPlanHistoryItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealPlanHistoryItemComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MealPlanHistoryItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
