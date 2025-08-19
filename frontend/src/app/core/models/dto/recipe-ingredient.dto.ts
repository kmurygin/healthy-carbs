import type {IngredientDto} from "./ingredient.dto";

export class RecipeIngredientDto {
  id: number;
  ingredient: IngredientDto;
  quantity: number;

  constructor(ingredient: IngredientDto, quantity: number) {
    this.id = 0;
    this.ingredient = ingredient;
    this.quantity = quantity;
  }
}
