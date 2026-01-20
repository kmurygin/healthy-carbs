import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';

import {RecipeCardComponent} from './recipe-card.component';

describe('RecipeCardComponent', () => {
  let component: RecipeCardComponent;
  let fixture: ComponentFixture<RecipeCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeCardComponent],
      providers: [provideRouter([])]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RecipeCardComponent);
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
      dietType: 'VEGAN',
      mealType: 'DINNER',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
      author: {
        id: '1',
        email: 'tom@riddle.com',
        role: 'AUTHOR',
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
