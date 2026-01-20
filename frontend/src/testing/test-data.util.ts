import type {RecipeDto} from '@core/models/dto/recipe.dto';
import type {UserDto} from '@core/models/dto/user.dto';
import type {RecipeIngredientDto} from '@core/models/dto/recipe-ingredient.dto';
import type {IngredientDto} from '@core/models/dto/ingredient.dto';
import type {MealPlanDayDto} from '@core/models/dto/mealplan-day.dto';
import type {MealPlanDto} from '@core/models/dto/mealplan.dto';
import {DietType} from '@core/models/enum/diet-type.enum';
import {MealType} from '@core/models/enum/meal-type.enum';
import {UserRole} from '@core/models/enum/user-role.enum';
import {IngredientCategory} from '@core/models/enum/ingredient-category.enum';
import {MealPlanSource} from '@core/models/enum/mealplan-source.enum';


export const DEFAULT_TEST_USER: UserDto = {
  id: 1,
  username: 'tomriddle',
  email: 'tom@riddle.com',
  role: UserRole.DIETITIAN,
  firstName: 'Tom',
  lastName: 'Riddle',
  profileImageId: null
};

export const REGULAR_TEST_USER: UserDto = {
  id: 2,
  username: 'testuser',
  email: 'user@test.com',
  role: UserRole.USER,
  firstName: 'Test',
  lastName: 'User',
  profileImageId: null
};

export const TEST_DATE = '2026-01-01';

export function createMockUser(overrides?: Partial<UserDto>): UserDto {
  return {
    ...DEFAULT_TEST_USER,
    ...overrides
  };
}

export function createMockIngredient(overrides?: Partial<IngredientDto>): IngredientDto {
  const base: IngredientDto = {
    id: 1,
    name: 'Test Ingredient',
    unit: 'g',
    caloriesPerUnit: 10,
    carbsPerUnit: 2,
    proteinPerUnit: 1,
    fatPerUnit: 0.5,
    category: IngredientCategory.VEGETABLES,
    author: null
  };
  return {...base, ...overrides};
}

export function createMockRecipeIngredient(overrides?: Partial<RecipeIngredientDto>): RecipeIngredientDto {
  const base: RecipeIngredientDto = {
    id: 1,
    ingredient: createMockIngredient(),
    quantity: 100
  };
  return {...base, ...overrides};
}

export function createMockRecipe(overrides?: Partial<RecipeDto>): RecipeDto {
  const base: RecipeDto = {
    id: 1,
    name: 'Test Recipe',
    description: 'A delicious test recipe',
    instructions: 'Mix all ingredients together',
    ingredients: [
      createMockRecipeIngredient(),
      createMockRecipeIngredient(
        {id: 2, ingredient: createMockIngredient({id: 2, name: 'Second Ingredient'})}
      )
    ],
    calories: 500,
    protein: 20,
    fat: 15,
    carbs: 60,
    dietType: DietType.VEGAN,
    mealType: MealType.DINNER,
    isFavourite: false,
    favouritesCount: 0,
    author: DEFAULT_TEST_USER
  };
  return {...base, ...overrides};
}

export function createMockMealPlanDay(overrides?: Partial<MealPlanDayDto>): MealPlanDayDto {
  const base: MealPlanDayDto = {
    id: 1,
    dayOfWeek: 'MONDAY',
    date: TEST_DATE,
    recipes: [],
    totalCalories: 2000,
    totalCarbs: 250,
    totalProtein: 100,
    totalFat: 70
  };
  return {...base, ...overrides};
}

export function createMockMealPlan(overrides?: Partial<MealPlanDto>): MealPlanDto {
  const base: MealPlanDto = {
    id: 1,
    user: REGULAR_TEST_USER,
    createdAt: TEST_DATE,
    days: [createMockMealPlanDay()],
    totalCalories: 2000,
    totalCarbs: 250,
    totalProtein: 100,
    totalFat: 70,
    source: MealPlanSource.GENERATED
  };
  return {...base, ...overrides};
}
