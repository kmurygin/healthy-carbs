import type {RecipeDto} from './recipe.dto';

export interface MealPlanRecipeDto {
  readonly id: number;
  readonly recipe: RecipeDto;
  readonly mealType: string;
}
