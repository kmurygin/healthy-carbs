import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import type {RecipeDto} from '../../../core/models/dto/recipe.dto';
import {getDietTagClasses, getDietTagIconClasses, getMealTagClasses} from "../../../shared/utils";

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
}
