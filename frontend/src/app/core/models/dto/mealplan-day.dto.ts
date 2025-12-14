import type {MealPlanRecipeDto} from './mealplan-recipe.dto';

export interface MealPlanDayDto {
  id: number;
  dayOfWeek: string;
  date: string;
  recipes: MealPlanRecipeDto[];
  totalCalories: number;
  totalCarbs: number;
  totalProtein: number;
  totalFat: number;
}
