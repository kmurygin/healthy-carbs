export interface MealPlanTemplateDto {
  readonly id: number;
  readonly name: string;
  readonly description: string | null;
  readonly totalCalories: number | null;
  readonly totalCarbs: number | null;
  readonly totalProtein: number | null;
  readonly totalFat: number | null;
}
