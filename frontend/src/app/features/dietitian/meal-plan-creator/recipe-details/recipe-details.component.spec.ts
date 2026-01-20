import {type ComponentFixture, TestBed} from '@angular/core/testing';

import {RecipeDetailsComponent} from './recipe-details.component';

describe('RecipeDetailsComponent', () => {
  let component: RecipeDetailsComponent;
  let fixture: ComponentFixture<RecipeDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeDetailsComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RecipeDetailsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('recipe', {
      id: '1',
      name: 'Test Recipe',
      calories: 500,
      protein: 20,
      fat: 15,
      carbs: 60,
      description: 'Test Description',
      ingredients: [],
      instructions: [],
      prepTime: 10,
      cookTime: 20,
      servings: 2,
      image: 'test.jpg',
      diet: 'VEGAN',
      meal: 'DINNER',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
      author: {
        id: '1',
        email: 'tom@riddle.com',
        role: 'DIETITIAN',
        firstName: 'Tom',
        lastName: 'Riddle'
      }
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
