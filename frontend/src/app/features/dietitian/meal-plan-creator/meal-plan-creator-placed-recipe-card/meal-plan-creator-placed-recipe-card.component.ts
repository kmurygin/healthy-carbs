import {CommonModule, DecimalPipe} from '@angular/common';
import {ChangeDetectionStrategy, Component, computed, input, output} from '@angular/core';
import type {RecipeDto} from '@core/models/dto/recipe.dto';
import {formatEnum, getDietTagClasses, getDietTagIconClasses} from '@shared/utils';
import type {MacroInfo} from '@features/recipes-list/recipes-list.types';
import {normalizeNumber} from "@features/dietitian/meal-plan-creator/meal-plan-creator.util";

@Component({
  selector: 'app-meal-plan-creator-placed-recipe-card',
  imports: [CommonModule, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="relative h-full min-w-0 rounded-xl border border-emerald-100 bg-white p-3 shadow-sm
      transition hover:border-emerald-500 hover:shadow-md flex flex-col group"
    >
      <div class="flex flex-col gap-2 pr-10">
        <h4
          class="font-bold text-sm text-gray-900 leading-snug line-clamp-2 min-w-0 min-h-10"
          [title]="recipe().name"
        >
          {{ recipe().name }}
        </h4>

        <div class="flex flex-wrap gap-2">
          <span [class]="dietTagClasses()">
            <i [class]="dietIconClasses()" aria-hidden="true"></i>
            {{ formatEnum(recipe().dietType) }}
          </span>
        </div>
      </div>

      <div
        class="absolute top-2 right-2 z-10 flex flex-col gap-1
        opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
      >
        <button
          type="button"
          class="p-1.5 rounded-full bg-white/90 shadow-sm
          text-gray-500 hover:text-red-600 hover:bg-red-50 hover:cursor-pointer"
          title="Remove from plan"
          aria-label="Remove from plan"
          (mousedown)="$event.stopPropagation()"
          (click)="onRemove($event)"
        >
          <i class="fa-solid fa-xmark text-xs" aria-hidden="true"></i>
        </button>

        <button
          type="button"
          class="p-1.5 rounded-full bg-white/90 shadow-sm
          text-gray-500 hover:text-emerald-600 hover:bg-blue-50 hover:cursor-pointer"
          title="View recipe details"
          aria-label="View recipe details"
          (mousedown)="$event.stopPropagation()"
          (click)="onDetails($event)"
        >
          <i class="fa-solid fa-circle-info text-xs" aria-hidden="true"></i>
        </button>
      </div>

      <div class="mt-3 flex flex-col gap-1 text-sm">
        @for (macro of macros(); track macro.label) {
          <div class="flex items-center justify-between gap-3 min-w-0">
            <span class="text-gray-500">{{ macro.label }}</span>
            <span class="font-semibold text-gray-900 whitespace-nowrap">
              {{ macro.value | number:'1.0-0' }} {{ macro.unit }}
            </span>
          </div>
        }
      </div>
    </div>
  `,
})
export class MealPlanCreatorPlacedRecipeCardComponent {
  readonly recipe = input.required<RecipeDto>();
  readonly remove = output<MouseEvent>();
  readonly viewDetails = output<MouseEvent>();
  protected readonly formatEnum = formatEnum;

  protected readonly dietTagClasses = computed(() =>
    getDietTagClasses(this.recipe().dietType, 'xs')
  );
  protected readonly dietIconClasses = computed(() =>
    getDietTagIconClasses(this.recipe().dietType)
  );

  protected readonly macros = computed<MacroInfo[]>(() => {
    const currentRecipe = this.recipe();
    return [
      {label: 'Calories', value: normalizeNumber(currentRecipe.calories), unit: 'kcal', icon: '', style: ''},
      {label: 'Carbs', value: normalizeNumber(currentRecipe.carbs), unit: 'g', icon: '', style: ''},
      {label: 'Protein', value: normalizeNumber(currentRecipe.protein), unit: 'g', icon: '', style: ''},
      {label: 'Fat', value: normalizeNumber(currentRecipe.fat), unit: 'g', icon: '', style: ''},
    ];
  });

  protected onRemove(mouseEvent: MouseEvent): void {
    mouseEvent.stopPropagation();
    this.remove.emit(mouseEvent);
  }

  protected onDetails(mouseEvent: MouseEvent): void {
    mouseEvent.stopPropagation();
    this.viewDetails.emit(mouseEvent);
  }
}
