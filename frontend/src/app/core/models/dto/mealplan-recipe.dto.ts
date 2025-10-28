import type {RecipeDto} from './recipe.dto';
import type {MealType} from "../enum/meal-type.enum";

export interface MealPlanRecipeDto {
  readonly id: number;
  readonly recipe: RecipeDto;
  readonly mealType: MealType;
}
