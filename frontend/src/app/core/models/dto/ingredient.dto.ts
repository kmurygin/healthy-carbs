import type {IngredientCategory} from "../enum/ingredient-category.enum";
import type {UserDto} from "@core/models/dto/user.dto";

export interface IngredientDto {
  readonly id: number;
  readonly name: string;
  readonly unit: string;
  readonly caloriesPerUnit: number;
  readonly carbsPerUnit: number;
  readonly proteinPerUnit: number;
  readonly fatPerUnit: number;
  readonly category: IngredientCategory;
  readonly author: UserDto | null;
}
