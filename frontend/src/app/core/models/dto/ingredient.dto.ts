import type {IngredientCategory} from "../enum/ingredient-category.enum";

export interface IngredientDto {
  readonly id: number;
  readonly name: string;
  readonly unit: string;
  readonly caloriesPerUnit: number;
  readonly carbsPerUnit: number;
  readonly proteinPerUnit: number;
  readonly fatPerUnit: number;
  readonly category: IngredientCategory;
}
