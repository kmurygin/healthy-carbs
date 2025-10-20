import type {IngredientCategory} from "../enum/ingredient-category.enum";

export interface ShoppingListItem {
  readonly name: string;
  readonly totalQuantity: number;
  readonly unit: string;
  readonly isBought: boolean;
}

export interface ShoppingList {
  readonly items: Readonly<Record<IngredientCategory, readonly ShoppingListItem[]>>;
}
