import {type ComponentFixture, TestBed} from '@angular/core/testing';

import {MealPlanCreatorPlacedRecipeCardComponent} from './meal-plan-creator-placed-recipe-card.component';

describe('MealPlanCreatorPlacedRecipeCardComponent', () => {
  let component: MealPlanCreatorPlacedRecipeCardComponent;
  let fixture: ComponentFixture<MealPlanCreatorPlacedRecipeCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealPlanCreatorPlacedRecipeCardComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MealPlanCreatorPlacedRecipeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
