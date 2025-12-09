import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {catchError, map, of, shareReplay, startWith, switchMap} from 'rxjs';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faExclamationCircle, faPlus, faSpinner, faUtensils} from '@fortawesome/free-solid-svg-icons';
import {RecipeService} from '@core/services/recipe/recipe.service';
import {IngredientService} from '@core/services/ingredient/ingredient.service';
import {AuthService} from '@core/services/auth/auth.service';
import {PaginationControlsComponent} from '../../../recipes-list/pagination-controls/pagination-controls.component';
import {RecipeFilterComponent} from '../../../recipes-list/recipe-filter/recipe-filter.component';
import {
  RecipesManagementFormComponent
} from '@features/resources-management/recipes/recipes-management-form/recipes-management-form.component';
import type {RecipeDto} from '@core/models/dto/recipe.dto';
import type {IngredientDto} from '@core/models/dto/ingredient.dto';
import type {Page} from '@core/models/page.model';
import type {RecipeSearchParams} from '@core/models/recipe-search.params';
import {DietType} from '@core/models/enum/diet-type.enum';
import {MealType} from '@core/models/enum/meal-type.enum';
import type {Option, RecipeFilters} from '../../../recipes-list/recipes-list.types';
import {
  RecipesManagementMobileListComponent
} from "@features/resources-management/recipes/recipes-management-mobile-list/recipes-management-mobile-list.component";
import {
  RecipesManagementTableComponent
} from "@features/resources-management/recipes/recipes-management-table/recipes-management-table.component";
import {AbstractManagementComponent} from "@shared/components/abstract-management/abstract-management.component";

const DEFAULT_PAGE_SIZE = 10;
const INITIAL_PAGE_INDEX = 0;
const INITIAL_PAGE: Page<RecipeDto> = {
  content: [], totalPages: 0, totalElements: 0, size: DEFAULT_PAGE_SIZE,
  number: INITIAL_PAGE_INDEX, first: true, last: true, empty: true
};

@Component({
  selector: 'app-recipes-management',
  imports: [
    CommonModule,
    FontAwesomeModule,
    PaginationControlsComponent,
    RecipeFilterComponent,
    RecipesManagementFormComponent,
    RecipesManagementMobileListComponent,
    RecipesManagementTableComponent
  ],
  templateUrl: './recipes-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecipesManagementComponent extends AbstractManagementComponent<RecipeDto> {
  readonly dietTypes = signal(Object.values(DietType));
  readonly mealTypes = signal(Object.values(MealType));

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

  readonly isDataLoading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  override reloadData(): void {
    this.searchParams.update(p => ({...p}));
  }

  override deleteItem(id: number): void {
    this.confirmAndDelete(id, 'Recipe', this.recipeService.delete(id));
  }

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

  private updateParams(changes: Partial<RecipeSearchParams>): void {
    this.searchParams.update(current => ({...current, ...changes}));
  }
}
