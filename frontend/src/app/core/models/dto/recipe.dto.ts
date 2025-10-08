import type {RecipeIngredientDto} from './recipe-ingredient.dto';

export interface RecipeDto {
  readonly id: number;
  readonly name: string;
  readonly description: string;
  readonly ingredients: readonly RecipeIngredientDto[];
  readonly calories: number;
  readonly carbs: number;
  readonly protein: number;
  readonly fat: number;
  readonly dietType: string;
  readonly mealType: string;
}
