import type {RecipeIngredientDto} from "./recipe-ingredient.dto";

export class RecipeDto {
  id: number;
  name: string;
  description: string;
  dietType: string;
  mealType: string;
  ingredients: RecipeIngredientDto[];

  constructor(id: number, name: string, description: string, dietType: string, mealType: string, ingredients: RecipeIngredientDto[]) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.dietType = dietType;
    this.mealType = mealType;
    this.ingredients = ingredients;
  }
}
