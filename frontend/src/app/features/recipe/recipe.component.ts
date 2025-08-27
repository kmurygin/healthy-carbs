import {ChangeDetectionStrategy, Component} from '@angular/core';
import type {RecipeDto} from "../../core/models/dto/recipe.dto";
import type {IngredientDto} from "../../core/models/dto/ingredient.dto";
import type {RecipeIngredientDto} from "../../core/models/dto/recipe-ingredient.dto";

@Component({
  selector: 'app-recipe',
  standalone: true,
  imports: [],
  templateUrl: './recipe.component.html',
  styleUrl: './recipe.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecipeComponent {

  ingredient1: IngredientDto = {
    id: 1,
    name: 'egg',
    unit: 'individual',
    caloriesPerUnit: 70,
    carbsPerUnit: 0.5,
    proteinPerUnit: 6,
    fatPerUnit: 5,
  };

  ingredient2: IngredientDto = {
    id: 1,
    name: 'butter',
    unit: 'grams',
    caloriesPerUnit: 11,
    carbsPerUnit: 0.5,
    proteinPerUnit: 6,
    fatPerUnit: 5,
  };

  ingredient3: IngredientDto = {
    id: 1,
    name: 'salt',
    unit: 'grams',
    caloriesPerUnit: 1,
    carbsPerUnit: 0.5,
    proteinPerUnit: 6,
    fatPerUnit: 5,
  };

  recipeIngredient1: RecipeIngredientDto = {
    id: 1,
    ingredient: this.ingredient1,
    quantity: 3,
  };

  recipeIngredient2: RecipeIngredientDto = {
    id: 1,
    ingredient: this.ingredient2,
    quantity: 20,
  };

  recipeIngredient3: RecipeIngredientDto = {
    id: 1,
    ingredient: this.ingredient3,
    quantity: 3,
  };

  recipe: RecipeDto = {
    id: 1,
    name: 'Scrambled eggs',
    description: 'Lorem ipsum',
    dietType: 'KETO',
    mealType: 'BREAKFAST',
    ingredients: [this.recipeIngredient1, this.recipeIngredient2, this.recipeIngredient3],
  };

  constructor() {
    console.log(this.recipe);
  }
}
