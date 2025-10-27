import type {RecipeIngredientDto} from './recipe-ingredient.dto';
import type {MealType} from "../enum/meal-type.enum";
import type {DietType} from "../enum/diet-type.enum";

export interface RecipeDto {
  readonly id: number;
  readonly name: string;
  readonly description: string;
  readonly instructions: string;
  readonly ingredients: readonly RecipeIngredientDto[];
  readonly calories: number;
  readonly carbs: number;
  readonly protein: number;
  readonly fat: number;
  readonly dietType: DietType;
  readonly mealType: MealType;
}
