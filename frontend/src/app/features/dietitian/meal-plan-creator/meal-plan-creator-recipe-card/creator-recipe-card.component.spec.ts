import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {
  MealPlanCreatorRecipeCardComponent
} from "@features/dietitian/meal-plan-creator/meal-plan-creator-recipe-card/creator-recipe-card.component";

describe('MealPlanCreatorRecipeCardComponent', () => {
  let component: MealPlanCreatorRecipeCardComponent;
  let fixture: ComponentFixture<MealPlanCreatorRecipeCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealPlanCreatorRecipeCardComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MealPlanCreatorRecipeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
