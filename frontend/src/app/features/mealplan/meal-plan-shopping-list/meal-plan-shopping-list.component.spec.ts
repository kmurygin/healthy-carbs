import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';

import {MealPlanShoppingListComponent} from './meal-plan-shopping-list.component';

describe('MealPlanShoppingListComponent', () => {
  let component: MealPlanShoppingListComponent;
  let fixture: ComponentFixture<MealPlanShoppingListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealPlanShoppingListComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MealPlanShoppingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
