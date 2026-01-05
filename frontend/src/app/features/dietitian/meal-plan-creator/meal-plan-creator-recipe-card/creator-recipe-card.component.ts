import {ChangeDetectionStrategy, Component, computed, input, output} from '@angular/core';
import {CommonModule, DecimalPipe} from '@angular/common';
import type {RecipeDto} from '@core/models/dto/recipe.dto';
import {formatEnum, getDietTagClasses, getDietTagIconClasses, getMealTagClasses} from '@shared/utils';
import type {MacroInfo} from '@features/recipes-list/recipes-list.types';
import {normalizeNumber} from "@features/dietitian/meal-plan-creator/meal-plan-creator.util";

@Component({
  selector: 'app-meal-plan-creator-recipe-card',
  imports: [CommonModule, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="bg-white rounded-lg border border-gray-200 shadow-sm p-3 h-full
      hover:border-emerald-500 hover:shadow-md transition-all group
      flex flex-col justify-between min-h-[130px] relative"
    >

      <div class="flex justify-between items-start gap-2 mb-2 pr-6">
        <h4
          class="font-bold text-sm text-gray-800 leading-snug line-clamp-2"
          [title]="recipe().name"
        >
          {{ recipe().name }}
        </h4>
      </div>

      <div class="flex gap-2 mb-2">
        <span [class]="dietTagClasses()">
          <i [class]="dietIconClasses()" aria-hidden="true"></i>
          {{ formatEnum(recipe().dietType) }}
        </span>
        <span [class]="mealTagClasses()">
          <i aria-hidden="true" class="fa-solid fa-plate-wheat text-xs"></i>
          {{ formatEnum(recipe().mealType) }}
        </span>
      </div>

      <div
        class="absolute top-2 right-2 flex flex-col gap-1 z-10
        opacity-0 group-hover:opacity-100 transition-opacity"
      >
        @if (canRemove()) {
          <button
            type="button"
            (mousedown)="$event.stopPropagation()"
            (click)="onRemove($event)"
            class="p-1.5 text-gray-400 hover:text-red-500 bg-white/90 hover:bg-red-50
            rounded-full shadow-sm transition-colors border border-transparent hover:border-red-100"
            title="Usuń z planu"
          >
            <i class="fa-solid fa-times text-xs" aria-hidden="true"></i>
          </button>
        }

        <button
          type="button"
          (mousedown)="$event.stopPropagation()"
          (click)="onDetails($event)"
          class="p-1.5 text-gray-400 hover:text-blue-500 bg-white/90 hover:bg-blue-50
          rounded-full shadow-sm transition-colors border border-transparent hover:border-blue-100
          hover:cursor-pointer"
          title="Szczegóły przepisu"
        >
          <i class="fa-solid fa-circle-info text-xs" aria-hidden="true"></i>
        </button>
      </div>

      <div class="mt-auto grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        @for (nutrient of macros(); track nutrient.label) {
          <div class="flex items-center justify-between gap-1.5">
            <div class="flex items-center">
              <i
                [class]="'fa-solid ' + nutrient.icon + ' ' + nutrient.style + ' w-3 text-center'"
                aria-hidden="true"
              ></i>
              <span class="text-gray-600">{{ nutrient.label }}:</span>
            </div>
            <span class="font-medium text-gray-900 whitespace-nowrap">
              {{ nutrient.value | number:'1.0-0' }} {{ nutrient.unit }}
            </span>
          </div>
        }
      </div>
    </div>
  `,
})
export class MealPlanCreatorRecipeCardComponent {
  readonly recipe = input.required<RecipeDto>();
  readonly canRemove = input(false);

  remove = output();
  viewDetails = output();

  protected readonly formatEnum = formatEnum;

  protected readonly dietTagClasses = computed(() => getDietTagClasses(this.recipe().dietType, 'xs'));
  protected readonly mealTagClasses = computed(() => getMealTagClasses('xs'));
  protected readonly dietIconClasses = computed(() => getDietTagIconClasses(this.recipe().dietType));

  protected readonly macros = computed<MacroInfo[]>(() => {
    const recipe = this.recipe();
    return [
      {
        label: 'Calories',
        value: normalizeNumber(recipe.calories),
        unit: 'kcal',
        icon: 'fa-fire',
        style: 'text-orange-500'
      },
      {
        label: 'Carbs',
        value: normalizeNumber(recipe.carbs),
        unit: 'g',
        icon: 'fa-bread-slice',
        style: 'text-amber-600'
      },
      {
        label: 'Protein',
        value: normalizeNumber(recipe.protein),
        unit: 'g',
        icon: 'fa-drumstick-bite',
        style: 'text-red-500'
      },
      {
        label: 'Fat',
        value: normalizeNumber(recipe.fat),
        unit: 'g',
        icon: 'fa-bottle-droplet',
        style: 'text-yellow-600'
      },
    ];
  });

  onRemove(event: Event): void {
    event.stopPropagation();
    this.remove.emit();
  }

  onDetails(event: Event): void {
    event.stopPropagation();
    this.viewDetails.emit();
  }
}
