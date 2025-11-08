import {ChangeDetectionStrategy, Component, computed, effect, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {RecipeService} from "../../../core/services/recipe/recipe.service";
import type {RecipeDto} from "../../../core/models/dto/recipe.dto";
import {catchError, EMPTY, map, of} from 'rxjs';
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
  readonly macros = computed(() => {
    const t = this.totals();
    return [
      {
        name: 'Calories',
        value: t.calories,
        unit: 'kcal',
        icon: 'fa-fire',
        color: 'text-orange-500',
      },
      {
        name: 'Carbs',
        value: t.carbs,
        unit: 'g',
        icon: 'fa-bread-slice',
        color: 'text-amber-600',
      },
      {
        name: 'Protein',
        value: t.protein,
        unit: 'g',
        icon: 'fa-drumstick-bite',
        color: 'text-red-500',
      },
      {
        name: 'Fat',
        value: t.fat,
        unit: 'g',
        icon: 'fa-bottle-droplet',
        color: 'text-yellow-600',
      },
    ];
  })
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(RecipeService);
  private readonly state = signal<RecipeState>(initialState);
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
  private readonly idSignal = toSignal(
    this.route.paramMap.pipe(map(params => Number(params.get('id')))),
    {initialValue: 0}
  );

  constructor() {
    effect(() => {
      const id = this.idSignal();
      if (id === 0) return;

      this.state.set(initialState);

      this.service.getById(id).pipe(
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
      ).subscribe(newState => {
        this.state.set(newState);
      });

    });
  }

  toggleFavourite(): void {
    const r = this.recipe();
    if (!r) {
      return;
    }

    const newStatus = !r.isFavourite;
    const newCount = r.favouritesCount + (newStatus ? 1 : -1);

    const request$ = newStatus
      ? this.service.addFavourite(r.id)
      : this.service.removeFavourite(r.id);

    this.state.update(currentState => {
      if (!currentState.recipe) return currentState;

      const updatedRecipe = {
        ...currentState.recipe,
        isFavourite: newStatus,
        favouritesCount: newCount
      };

      return {...currentState, recipe: updatedRecipe};
    });

    request$.pipe(
      catchError(() => {
        this.state.update(currentState => {
          if (!currentState.recipe) return currentState;
          return {...currentState, recipe: r};
        });
        return EMPTY;
      })
    ).subscribe();
  }
}
