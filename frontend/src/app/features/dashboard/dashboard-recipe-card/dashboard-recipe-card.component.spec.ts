import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';

import {DashboardRecipeCardComponent} from './dashboard-recipe-card.component';

describe('DashboardRecipeCardComponent', () => {
  let component: DashboardRecipeCardComponent;
  let fixture: ComponentFixture<DashboardRecipeCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardRecipeCardComponent],
      providers: [provideRouter([])]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardRecipeCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('item', {
      recipe: {
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
          id: 'u1',
          email: 'auth@test.com',
          role: 'DIETITIAN',
          firstName: 'Tom',
          lastName: 'Riddle'
        }
      },
      mealType: 'DINNER',
      orderIndex: 0
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
