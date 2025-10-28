import {ChangeDetectionStrategy, Component, computed, input, signal} from '@angular/core';
import {CommonModule, TitleCasePipe} from '@angular/common';
import type {MealPlanDayDto} from '../../../core/models/dto/mealplan-day.dto';
import type {MealPlanRecipeDto} from '../../../core/models/dto/mealplan-recipe.dto';
import {RouterModule} from '@angular/router';
import type {Grouped, Macros} from "../mealplan.util";
import {roundMacros} from "../mealplan.util";

@Component({
  selector: 'app-mealplan-history-item',
  imports: [CommonModule, TitleCasePipe, RouterModule],
  templateUrl: './meal-plan-history-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealPlanHistoryItemComponent {
  readonly mealPlanDay = input.required<MealPlanDayDto>();
  readonly isExpanded = signal(false);

  readonly dayTotals = computed<Macros>(() => {
    const day = this.mealPlanDay();
    return roundMacros({
      calories: day.totalCalories,
      carbs: day.totalCarbs,
      protein: day.totalProtein,
      fat: day.totalFat,
    });
  });

  readonly groupedByMealType = computed<readonly Grouped[]>(() => {
    const day = this.mealPlanDay();
    const recipesByMealType = new Map<string, MealPlanRecipeDto[]>();
    for (const item of day.recipes) {
      const list = recipesByMealType.get(item.mealType) ?? [];
      list.push(item);
      recipesByMealType.set(item.mealType, list);
    }
    return Array.from(recipesByMealType.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mealType, items]) => ({mealType, items}));
  });

  readonly recipeMacrosMap = computed(() => {
    const day = this.mealPlanDay();
    const macrosMap = new Map<number, Macros>();

    for (const mealPlanRecipe of day.recipes) {
      const recipe = mealPlanRecipe.recipe;
      macrosMap.set(mealPlanRecipe.id, roundMacros({
        calories: recipe.calories,
        carbs: recipe.carbs,
        protein: recipe.protein,
        fat: recipe.fat,
      }));
    }

    return macrosMap;
  });


  toggleExpanded(): void {
    this.isExpanded.update(currentState => !currentState);
  }
}
