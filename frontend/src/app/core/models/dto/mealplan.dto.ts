import type {UserDto} from './user.dto';
import type {MealPlanDayDto} from "./mealplan-day.dto";

export interface MealPlanDto {
  id: number;
  user: UserDto;
  days: MealPlanDayDto[];
  totalCalories: number;
  totalCarbs: number;
  totalProtein: number;
  totalFat: number;
  createdAt: string;
}
