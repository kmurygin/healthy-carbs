import type {IngredientCategory} from "@core/models/enum/ingredient-category.enum";

export interface IngredientSearchParams {
  page: number;
  size: number;
  name?: string | null;
  category?: IngredientCategory | null;
  onlyMine?: boolean;
}
