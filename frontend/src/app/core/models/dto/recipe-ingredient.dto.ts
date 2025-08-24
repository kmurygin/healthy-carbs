import type {IngredientDto} from './ingredient.dto';

export interface RecipeIngredientDto {
  readonly id: number;
  readonly ingredient: IngredientDto;
  readonly quantity: number;
}
