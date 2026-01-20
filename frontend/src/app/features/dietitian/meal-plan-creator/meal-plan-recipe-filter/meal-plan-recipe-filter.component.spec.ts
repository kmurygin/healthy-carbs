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
    fixture.componentRef.setInput('dietTypes', []);
    fixture.componentRef.setInput('mealTypes', []);
    fixture.componentRef.setInput('sortOptions', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
