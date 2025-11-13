import type {UserDto} from './user.dto';
import type {MealPlanDayDto} from "./mealplan-day.dto";
import type {MealPlanSource} from "@core/models/enum/mealplan-source.enum";

export interface MealPlanDto {
  id: number;
  user: UserDto;
  days: MealPlanDayDto[];
  totalCalories: number;
  totalCarbs: number;
  totalProtein: number;
  totalFat: number;
  createdAt: string;
  source: MealPlanSource;
}
