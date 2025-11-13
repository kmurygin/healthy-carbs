import {ChangeDetectionStrategy, Component, computed, input, output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import type {RecipeDto} from '@core/models/dto/recipe.dto';
import {formatEnum, getDietTagClasses, getDietTagIconClasses, getMealTagClasses} from "@shared/utils";
import type {MacroInfo} from "@features/recipes-list/recipes-list.types";

@Component({
  selector: 'app-recipe-card',
  imports: [CommonModule, RouterModule],
  templateUrl: './recipe-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeCardComponent {
  readonly recipe = input.required<RecipeDto>();

  readonly dietTagClasses = computed(() => {
    return getDietTagClasses(this.recipe().dietType, 'xs');
  });

  readonly mealTagClasses = computed(() => {
    return getMealTagClasses('xs')
  });

  readonly dietIconClasses = computed(() => {
    return getDietTagIconClasses(this.recipe().dietType);
  });

  readonly favouriteDisplayCount = computed(() => {
    const favouritesCount = this.recipe().favouritesCount;
    return favouritesCount < 100 ? String(favouritesCount) : '99+';
  });

  readonly macros = computed<MacroInfo[]>(() => [
    {
      label: 'Calories',
      value: this.recipe().calories,
      unit: '',
      icon: 'fa-fire',
      style: 'text-orange-500',
    },
    {
      label: 'Carbs',
      value: this.recipe().carbs,
      unit: 'g',
      icon: 'fa-bread-slice',
      style: 'text-amber-600',
    },
    {
      label: 'Protein',
      value: this.recipe().protein,
      unit: 'g',
      icon: 'fa-drumstick-bite',
      style: 'text-red-500',
    },
    {
      label: 'Fat',
      value: this.recipe().fat,
      unit: 'g',
      icon: 'fa-bottle-droplet',
      style: 'text-yellow-600',
    },
  ])

  favouriteToggled = output<number>();
  protected readonly formatEnum = formatEnum;

  onToggleFavourite(recipeId: number): void {
    this.favouriteToggled.emit(recipeId);
  }
}
