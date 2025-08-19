import type {RecipeDto} from "./recipe.dto";

export class MealplanRecipeDto {
  id: number;
  recipe: RecipeDto;
  mealType: string;

  constructor(recipe: RecipeDto, mealType: string) {
    this.id = 0;
    this.recipe = recipe;
    this.mealType = mealType;
  }
}
