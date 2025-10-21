import type {Signal} from '@angular/core';
import {ChangeDetectionStrategy, Component, computed, input, output} from '@angular/core';
import {CommonModule} from '@angular/common';
import type {MealPlanDayDto} from '../../../core/models/dto/mealplan-day.dto';
import type {MealPlanRecipeDto} from '../../../core/models/dto/mealplan-recipe.dto';
import type {RecipeDto} from '../../../core/models/dto/recipe.dto';

type MealGroup = Readonly<{ mealType: string; items: readonly MealPlanRecipeDto[] }>;
type NutritionalInformation = Readonly<{ calories: number; carbs: number; protein: number; fat: number }>;

@Component({
  selector: 'app-daily-meal-plan',
  imports: [CommonModule],
  templateUrl: './daily-meal-plan.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DailyMealPlanComponent {
  readonly dailyPlan = input<MealPlanDayDto | null>(null);
  readonly recipeDetails = input<ReadonlyMap<number, RecipeDto>>(new Map());
  readonly expandedRecipeIds = input<ReadonlySet<number>>(new Set());
  readonly recipeMacrosMap = input<ReadonlyMap<number, NutritionalInformation>>(new Map());
  readonly toggleRecipe = output<number>();

  readonly groupedByMealType: Signal<readonly MealGroup[]> = computed(() => {
    const plan = this.dailyPlan();
    if (!plan) return [];

    const groups = new Map<string, MealPlanRecipeDto[]>();
    for (const recipe of plan.recipes ?? []) {
      const mealType = recipe.mealType ?? 'Meal';
      const list = groups.get(mealType) ?? [];
      list.push(recipe);
      groups.set(mealType, list);
    }
    return Array.from(groups.entries()).map(([mealType, items]) => ({mealType, items}));
  });

  onToggleRecipe(recipeId: number): void {
    this.toggleRecipe.emit(recipeId);
  }
}
