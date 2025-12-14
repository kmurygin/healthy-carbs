import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {CommonModule, DecimalPipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faChevronRight} from '@fortawesome/free-solid-svg-icons';
import type {MealPlanRecipeDto} from "@core/models/dto/mealplan-recipe.dto";
import type {RecipeDto} from "@core/models/dto/recipe.dto";
import type {NutrientGridItem} from "@core/models/dashboard.model";

@Component({
  selector: 'app-dashboard-recipe-card',
  imports: [CommonModule, RouterLink, DecimalPipe, FaIconComponent],
  template: `
    <a
      [routerLink]="['/recipes', item().recipe.id]"
      class="group relative flex flex-col bg-white rounded-2xl p-4 border border-gray-100
      transition-all duration-300 hover:shadow-lg hover:border-emerald-100"
    >

      <div class="flex items-start justify-between mb-3">
        <span
          class="px-2.5 py-1 rounded-lg bg-emerald-600 text-[10px]
          font-bold text-white uppercase tracking-wider shadow-sm"
        >
          {{ item().mealType }}
        </span>

        <div class="flex items-baseline gap-1 text-gray-900">
          <span class="font-bold text-sm">{{ item().recipe.calories | number:'1.0-0' }}</span>
          <span class="text-[10px] text-gray-400 font-medium">kcal</span>
        </div>
      </div>

      <div class="mb-5">
        <h4 class="text-base font-bold text-gray-900 leading-snug
                   group-hover:text-emerald-700 transition-colors">
          {{ item().recipe.name }}
        </h4>
        @if (item().recipe.description) {
          <p class="text-xs text-gray-400 mt-1 line-clamp-1 font-medium">
            {{ item().recipe.description }}
          </p>
        }
      </div>

      <div class="mt-auto grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100 pt-3">
        @for (nutrient of nutrientData(); track nutrient.label) {
          <div class="flex flex-col items-center justify-center gap-0.5">
            <div class="text-[10px] font-bold uppercase tracking-wider"
                 [class]="nutrient.colorClass">
              <span>{{ nutrient.label }}</span>
            </div>

            <span class="text-sm font-bold text-gray-700">
              {{ nutrient.value | number:'1.0-0' }}
              <span class="text-[10px] font-medium text-gray-400">g</span>
            </span>
          </div>
        }
      </div>

      <div
        class="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 -translate-x-2
        group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none"
      >
        <div class="flex items-center justify-center w-8 h-8 rounded-lg text-emerald-500">
          <fa-icon [icon]="faChevronRight" class="text-xs"></fa-icon>
        </div>
      </div>

    </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardRecipeCardComponent {
  readonly item = input.required<MealPlanRecipeDto>();
  readonly nutrientData = computed((): NutrientGridItem[] => {
    const recipe: RecipeDto = this.item().recipe;
    return [
      {
        label: 'Protein',
        value: recipe.protein,
        colorClass: 'text-red-500'
      },
      {
        label: 'Fat',
        value: recipe.fat,
        colorClass: 'text-yellow-500'
      },
      {
        label: 'Carbs',
        value: recipe.carbs,
        colorClass: 'text-amber-500'
      },
    ];
  });
  protected readonly faChevronRight = faChevronRight;
}
