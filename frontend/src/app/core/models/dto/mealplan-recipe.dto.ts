import type {RecipeDto} from './recipe.dto';
import type {MealPlanDto} from "./mealplan.dto";

export interface MealPlanRecipeDto {
  id: number;
  mealPlan: MealPlanDto;
  recipe: RecipeDto;
}
