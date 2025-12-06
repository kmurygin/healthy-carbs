import {ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {takeUntilDestroyed, toObservable, toSignal} from '@angular/core/rxjs-interop';
import {catchError, filter, map, of, shareReplay, startWith, switchMap} from 'rxjs';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faExclamationCircle, faPlus, faSpinner, faUtensils} from '@fortawesome/free-solid-svg-icons';
import {RecipeService} from '@core/services/recipe/recipe.service';
import {IngredientService} from '@core/services/ingredient/ingredient.service';
import {AuthService} from '@core/services/auth/auth.service';
import {ConfirmationService} from '@core/services/ui/confirmation.service';
import {NotificationService} from '@core/services/ui/notification.service';
import {PaginationControlsComponent} from '../../recipes-list/pagination-controls/pagination-controls.component';
import {RecipeFilterComponent} from '../../recipes-list/recipe-filter/recipe-filter.component';
import {
  DietitianRecipesFormComponent
} from '@features/dietitian/dietitian-recipes-form/dietitian-recipes-form.component';
import type {RecipeDto} from '@core/models/dto/recipe.dto';
import type {IngredientDto} from '@core/models/dto/ingredient.dto';
import type {Page} from '@core/models/page.model';
import type {RecipeSearchParams} from '@core/models/recipe-search.params';
import {DietType} from '@core/models/enum/diet-type.enum';
import {MealType} from '@core/models/enum/meal-type.enum';
import type {Option, RecipeFilters} from '../../recipes-list/recipes-list.types';
import {
  DietitianRecipeMobileListComponent
} from "@features/dietitian/dietitian-recipe-mobile-list/dietitian-recipe-mobile-list.component";
import {
  DietitianRecipeTableComponent
} from "@features/dietitian/dietitian-recipe-table/dietitian-recipe-table.component";

const DEFAULT_PAGE_SIZE = 10;
const INITIAL_PAGE_INDEX = 0;
const INITIAL_PAGE: Page<RecipeDto> = {
  content: [], totalPages: 0, totalElements: 0, size: DEFAULT_PAGE_SIZE,
  number: INITIAL_PAGE_INDEX, first: true, last: true, empty: true
};

@Component({
  selector: 'app-dietitian-recipes',
  imports: [
    CommonModule,
    FontAwesomeModule,
    PaginationControlsComponent,
    RecipeFilterComponent,
    DietitianRecipesFormComponent,
    DietitianRecipeMobileListComponent,
    DietitianRecipeTableComponent
  ],
  templateUrl: './dietitian-recipes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DietitianRecipesComponent {
  readonly dietTypes = signal(Object.values(DietType));
  readonly mealTypes = signal(Object.values(MealType));
  readonly isFormOpen = signal(false);
  readonly selectedRecipeId = signal<number | null>(null);
  readonly sortOptions: Option[] = [
    {value: '', label: 'Default'},
    {value: 'name,asc', label: 'Name (A-Z)'},
    {value: 'name,desc', label: 'Name (Z-A)'},
    {value: 'calories,asc', label: 'Calories (Low to High)'},
    {value: 'calories,desc', label: 'Calories (High to Low)'},
  ];
  protected readonly icons = {
    spinner: faSpinner,
    plus: faPlus,
    utensils: faUtensils,
    warn: faExclamationCircle
  };
  private readonly recipeService = inject(RecipeService);
  private readonly ingredientService = inject(IngredientService);
  readonly cachedIngredients = toSignal(
    this.ingredientService.getAll().pipe(
      map(response => response ?? []),
      shareReplay({bufferSize: 1, refCount: true}),
      catchError((err: unknown) => {
        console.error('Failed to pre-load ingredients', err);
        return of([] as IngredientDto[]);
      })
    ),
    {initialValue: null}
  );

  private readonly authService = inject(AuthService);
  readonly currentUserId = this.authService.userId();
  private readonly confirmationService = inject(ConfirmationService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchParams = signal<RecipeSearchParams>({
    page: INITIAL_PAGE_INDEX,
    size: DEFAULT_PAGE_SIZE,
  });
  private readonly state = toSignal(
    toObservable(this.searchParams).pipe(
      switchMap(params => this.recipeService.getAll(params).pipe(
        map(page => ({page, loading: false, error: null})),
        catchError((err: unknown) => {
          console.error('Recipe load error:', err);
          return of({
            page: INITIAL_PAGE,
            loading: false,
            error: 'Failed to load recipes. Please try again later.'
          });
        })
      )),
      startWith({page: INITIAL_PAGE, loading: true, error: null})
    ),
    {initialValue: {page: INITIAL_PAGE, loading: true, error: null}}
  );
  readonly recipes = computed(() => this.state().page.content);
  readonly totalElements = computed(() => this.state().page.totalElements);
  readonly totalPages = computed(() => this.state().page.totalPages);
  readonly currentPage = computed(() => this.state().page.number);
  readonly isLoading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  handleFiltersChange(filters: RecipeFilters): void {
    this.searchParams.update(current => ({
      ...current,
      page: INITIAL_PAGE_INDEX,
      name: filters.name || undefined,
      ingredient: filters.ingredient || undefined,
      diet: filters.diet || undefined,
      meal: filters.meal || undefined,
      sort: filters.sort || undefined
    }));
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.updateParams({page: this.currentPage() + 1});
    }
  }

  prevPage(): void {
    if (this.currentPage() > 0) {
      this.updateParams({page: this.currentPage() - 1});
    }
  }

  createRecipe(): void {
    this.selectedRecipeId.set(null);
    this.isFormOpen.set(true);
  }

  editRecipe(id: number): void {
    this.selectedRecipeId.set(id);
    this.isFormOpen.set(true);
  }

  closeCreateModal(): void {
    this.isFormOpen.set(false);
    this.selectedRecipeId.set(null);
  }

  onRecipeCreated(): void {
    this.isFormOpen.set(false);
    this.selectedRecipeId.set(null);
    this.notificationService.success('Recipe saved successfully');
    this.searchParams.update(p => ({...p}));
  }

  deleteRecipe(id: number): void {
    this.confirmationService.confirm(
      'Are you sure you want to delete this recipe? This action cannot be undone.',
      'Delete Recipe',
      'danger'
    ).pipe(
      filter(Boolean),
      switchMap(() => this.recipeService.delete(id)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.notificationService.success('Recipe deleted successfully');
        this.searchParams.update(params => ({...params}));
      },
      error: (err: unknown) => {
        console.error('Delete failed', err);
        this.notificationService.error('Failed to delete recipe. Please try again.');
      }
    });
  }

  private updateParams(changes: Partial<RecipeSearchParams>): void {
    this.searchParams.update(current => ({...current, ...changes}));
  }
}
