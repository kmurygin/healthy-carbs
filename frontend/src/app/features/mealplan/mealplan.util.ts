import type {MealPlanDto} from "../../core/models/dto/mealplan.dto";
import type {MealPlanRecipeDto} from "../../core/models/dto/mealplan-recipe.dto";

export type Macros = Readonly<{
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}>;

export type Grouped = Readonly<{
  mealType: string;
  items: readonly MealPlanRecipeDto[];
}>;

export interface HistoryState {
  readonly plans: MealPlanDto[];
  readonly loading: boolean;
  readonly error: string | null;
}

export type MealPlanRow = Readonly<{
  idx: number;
  id: number;
  daysCount: number;
  total: Macros;
  createdAt: string;
  plan: MealPlanDto;
}>;

function averageMacros(
  macros: Macros,
  daysCount: number
): Macros {
  const days = Math.max(1, daysCount);
  return roundMacros({
    calories: macros.calories / days,
    carbs: macros.carbs / days,
    protein: macros.protein / days,
    fat: macros.fat / days,
  });
}

export function roundMacros(macros: Macros): Macros {
  return {
    calories: Math.round(macros.calories),
    carbs: Math.round(macros.carbs),
    protein: Math.round(macros.protein),
    fat: Math.round(macros.fat),
  };
}

export function convertToTimestamp(value: string | Date): number {
  return (value instanceof Date ? value : new Date(value)).getTime();
}

export function toRow(mealPlan: MealPlanDto, idx: number): MealPlanRow {
  const daysCount = mealPlan.days.length;

  const total = averageMacros(
    {
      calories: mealPlan.totalCalories,
      carbs: mealPlan.totalCarbs,
      protein: mealPlan.totalProtein,
      fat: mealPlan.totalFat,
    },
    daysCount
  );

  return {
    idx,
    id: mealPlan.id,
    daysCount,
    total,
    createdAt: mealPlan.createdAt,
    plan: mealPlan,
  };
}

export function buildRows(mealPlans: readonly MealPlanDto[]): readonly MealPlanRow[] {
  return mealPlans
    .slice()
    .sort((a, b) => {
      return convertToTimestamp(b.createdAt) - convertToTimestamp(a.createdAt)
    })
    .map(toRow);
}

