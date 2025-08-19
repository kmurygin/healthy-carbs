import type {MealplanRecipeDto} from "./mealplan-recipe.dto";

export class MealPlanDto {
  id: number;
  userId: number;
  createdAt: string;
  totalCalories: number;
  totalCarbs: number;
  totalProtein: number;
  totalFat: number;
  recipes: MealplanRecipeDto[];

  constructor(id: number, userId: number, createdAt: string, totalCalories: number, totalCarbs: number, totalProtein: number, totalFat: number, recipes: MealplanRecipeDto[]) {
    this.id = id;
    this.userId = userId;
    this.createdAt = createdAt;
    this.totalCalories = totalCalories;
    this.totalCarbs = totalCarbs;
    this.totalProtein = totalProtein;
    this.totalFat = totalFat;
    this.recipes = recipes;
  }
}
