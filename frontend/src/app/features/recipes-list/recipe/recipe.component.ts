import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {RecipeService} from "../../../core/services/recipe/recipe.service";
import type {RecipeDto} from "../../../core/models/dto/recipe.dto";
import {catchError, map, of, startWith, switchMap} from 'rxjs';
import {toSignal} from "@angular/core/rxjs-interop";
import {ErrorMessageComponent} from "../../../shared/components/error-message/error-message.component";
import {getDietTagClasses, getDietTagIconClasses, getMealTagClasses} from "../../../shared/utils";

interface RecipeState {
  recipe: RecipeDto | null;
  loading: boolean;
  error: string | null;
}

const initialState: RecipeState = {
  recipe: null,
  loading: true,
  error: null,
};

@Component({
  selector: 'app-recipe-detail',
  imports: [CommonModule, RouterModule, ErrorMessageComponent],
  templateUrl: 'recipe.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeComponent {
  readonly mealTagClasses = computed(() => {
    return getMealTagClasses('sm')
  });
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(RecipeService);
  private readonly state = toSignal(
    this.route.paramMap.pipe(
      map(params => Number(params.get('id'))),
      switchMap(id => {
        if (Number.isNaN(id)) {
          return of({
            recipe: null,
            loading: false,
            error: 'Invalid recipe ID'
          });
        }
        return this.service.getById(id).pipe(
          map(data => ({
            recipe: data,
            loading: false,
            error: null
          })),
          catchError((err: unknown) => {
            console.error(err);
            return of({
              recipe: null,
              loading: false,
              error: 'Failed to fetch recipe data'
            });
          })
        );
      }),
      startWith(initialState)
    ),
    {initialValue: initialState}
  );
  readonly recipe = computed(() => this.state().recipe);
  readonly totals = computed(() => {
    const selectedRecipe = this.recipe();
    if (!selectedRecipe) return {calories: 0, carbs: 0, protein: 0, fat: 0};

    return selectedRecipe.ingredients.reduce(
      (totals, ri) => ({
        calories: totals.calories + ri.quantity * ri.ingredient.caloriesPerUnit,
        carbs: totals.carbs + ri.quantity * ri.ingredient.carbsPerUnit,
        protein: totals.protein + ri.quantity * ri.ingredient.proteinPerUnit,
        fat: totals.fat + ri.quantity * ri.ingredient.fatPerUnit,
      }),
      {calories: 0, carbs: 0, protein: 0, fat: 0}
    );
  });
  readonly dietTagClasses = computed(() => {
    return getDietTagClasses(this.recipe()?.dietType, 'sm')
  });
  readonly dietIconClasses = computed(() => {
    return getDietTagIconClasses(this.recipe()?.dietType);
  });
  readonly errorMessage = computed(() => this.state().error);
  readonly isLoading = computed(() => this.state().loading);

}
