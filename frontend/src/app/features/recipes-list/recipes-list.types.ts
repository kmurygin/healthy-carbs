import type {MealType} from "@core/models/enum/meal-type.enum";

export interface RecipeFilters {
  name: string;
  ingredient: string;
  diet: string;
  meal: '' | MealType;
  sort: string;
}

export interface Option {
  value: string;
  label: string;
}

export interface MacroInfo {
  label: string;
  value: number;
  unit: string;
  icon: string;
  style: string;
}
