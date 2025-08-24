import type {MealPlanRecipeDto} from './mealplan-recipe.dto';
import type {UserDto} from './user.dto';

export interface MealPlanDto {
  id: number;
  user: UserDto;
  recipes: MealPlanRecipeDto[];
  totalCalories: number;
  totalCarbs: number;
  totalProtein: number;
  totalFat: number;
}
