import type {RecipeIngredientDto} from './recipe-ingredient.dto';

export interface RecipeDto {
  readonly id: number;
  readonly name: string;
  readonly description: string;
  readonly dietType: string;
  readonly mealType: string;
  readonly ingredients: readonly RecipeIngredientDto[];
}
