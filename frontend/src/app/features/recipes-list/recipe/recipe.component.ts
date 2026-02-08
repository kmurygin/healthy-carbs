import {ChangeDetectionStrategy, Component, computed, effect, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {RecipeService} from "@core/services/recipe/recipe.service";
import type {RecipeDto} from "@core/models/dto/recipe.dto";
import {catchError, EMPTY, map, of} from 'rxjs';
import {toSignal} from "@angular/core/rxjs-interop";
import {ErrorMessageComponent} from "@shared/components/error-message/error-message.component";
import {formatEnum, getDietTagClasses, getDietTagIconClasses, getMealTagClasses} from "@shared/utils";
import type {MacroInfo} from "@features/recipes-list/recipes-list.types";

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
  readonly macros = computed<MacroInfo[]>(() => {
    const totals = this.totals();
    return [
      {
        label: 'Calories',
        value: totals.calories,
        unit: 'kcal',
        icon: 'fa-fire',
        style: 'text-orange-500',
      },
      {
        label: 'Carbs',
        value: totals.carbs,
        unit: 'g',
        icon: 'fa-bread-slice',
        style: 'text-amber-600',
      },
      {
        label: 'Protein',
        value: totals.protein,
        unit: 'g',
        icon: 'fa-drumstick-bite',
        style: 'text-red-500',
      },
      {
        label: 'Fat',
        value: totals.fat,
        unit: 'g',
        icon: 'fa-bottle-droplet',
        style: 'text-yellow-600',
      },
    ];
  })
  protected readonly formatEnum = formatEnum;
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly recipeService = inject(RecipeService);
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
  readonly instructionSteps = computed<string[]>(() => {
    const trimmedInstructions = this.recipe()?.instructions.trim() ?? '';
    return trimmedInstructions
      .split(/\r?\n+|\s+(?=\d+\.\s)/)
      .map(line => line.trim().replace(/^\d+\.\s*/, ''))
      .filter(line => line.length > 0);
  });
  readonly errorMessage = computed(() => this.state().error);
  readonly isLoading = computed(() => this.state().loading);
  private readonly idSignal = toSignal(
    this.activatedRoute.paramMap.pipe(map(params => Number(params.get('id')))),
    {initialValue: 0}
  );

  constructor() {
    effect(() => {
      const id = this.idSignal();
      if (id === 0) return;

      this.state.set(initialState);

      this.recipeService.getById(id).pipe(
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
    const recipe = this.recipe();
    if (!recipe) return;

    const newFavouriteStatus = !recipe.isFavourite;
    const currentFavouritesCount = Number.isFinite(recipe.favouritesCount) ? recipe.favouritesCount : 0;
    const newCount = Math.max(0, currentFavouritesCount + (newFavouriteStatus ? 1 : -1));

    const request$ = newFavouriteStatus ? this.recipeService.addFavourite(recipe.id)
      : this.recipeService.removeFavourite(recipe.id);

    this.state.update(state => state.recipe
      ? {...state, recipe: {...state.recipe, isFavourite: newFavouriteStatus, favouritesCount: newCount}}
      : state
    );

    request$.pipe(
      catchError(() => {
        this.state.update(state => state.recipe ? {...state, recipe: recipe} : state);
        return EMPTY;
      })
    ).subscribe();
  }
}
