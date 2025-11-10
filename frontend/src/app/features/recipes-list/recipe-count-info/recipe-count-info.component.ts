import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';

@Component({
  selector: 'app-recipe-count-info',
  imports: [],
  templateUrl: './recipe-count-info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeCountInfoComponent {
  readonly startIndex = input.required<number>();
  readonly endIndex = input.required<number>();

  readonly _startIndex = computed(() => this.startIndex() + 1);
  readonly totalRecipeCount = input.required<number>();
  readonly _endIndex = computed(() => Math.min(this.endIndex(), this.totalRecipeCount()));
}
