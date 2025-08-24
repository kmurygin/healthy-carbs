import { RecipeDto } from './recipe.dto';
import {MealPlanDto} from "./mealplan.dto";

export interface MealPlanRecipeDto {
  id: number;
  mealPlan: MealPlanDto;
  recipe: RecipeDto;
}
