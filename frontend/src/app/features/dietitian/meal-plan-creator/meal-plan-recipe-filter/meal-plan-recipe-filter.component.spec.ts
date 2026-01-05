import {type ComponentFixture, TestBed} from '@angular/core/testing';

import {MealPlanRecipeFilterComponent} from './meal-plan-recipe-filter.component';

describe('MealPlanRecipeFilterComponent', () => {
  let component: MealPlanRecipeFilterComponent;
  let fixture: ComponentFixture<MealPlanRecipeFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealPlanRecipeFilterComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MealPlanRecipeFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
