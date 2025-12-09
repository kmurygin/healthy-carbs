import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';

import {RouterModule} from '@angular/router';
import {RecipeService} from '@core/services/recipe/recipe.service';
import type {RecipeDto} from '@core/models/dto/recipe.dto';
import {toObservable, toSignal} from "@angular/core/rxjs-interop";
import {catchError, EMPTY, map, of, startWith, switchMap} from "rxjs";
import type {Page} from "@core/models/page.model";
import {RecipeCardComponent} from "../recipe-card/recipe-card.component";
import type {RecipeSearchParams} from "@core/models/recipe-search.params";
import {DietType} from "@core/models/enum/diet-type.enum";
import {MealType} from "@core/models/enum/meal-type.enum";
import {KeyboardKey} from "@shared/keyboard-key.enum";
import {ErrorMessageComponent} from "@shared/components/error-message/error-message.component";
import {RecipeFilterComponent} from "../recipe-filter/recipe-filter.component";
import {PaginationControlsComponent} from "../pagination-controls/pagination-controls.component";
import {RecipeCountInfoComponent} from "../recipe-count-info/recipe-count-info.component";
import {PageSizeSelectorComponent} from "../page-size-selector/page-size-selector.component";
import {FavouriteRecipesToggleComponent} from "../favourite-recipes-toggle/favourite-recipes-toggle.component";
import {InfoMessageComponent} from "@shared/components/info-message/info-message.component";
import type {Option, RecipeFilters} from "@features/recipes-list/recipes-list.types";

const DEFAULT_PAGE_SIZE = 6;
const PAGE_SIZE_OPTIONS = [6, 9, 12];
const INITIAL_PAGE_NUMBER = 1;
const BACKEND_INITIAL_PAGE_INDEX = 0;

const initialPage: Page<RecipeDto> = {
  content: [],
  totalPages: 1,
  totalElements: 0,
  size: DEFAULT_PAGE_SIZE,
  number: BACKEND_INITIAL_PAGE_INDEX,
  first: true,
  last: true,
  empty: true
};

const initialState = {
  page: initialPage,
  loading: true,
  error: null,
};

@Component({
  selector: 'app-recipe-list',
  imports: [
    RouterModule,
    RecipeCardComponent,
    ErrorMessageComponent,
    RecipeFilterComponent,
    PaginationControlsComponent,
    RecipeCountInfoComponent,
    PageSizeSelectorComponent,
    FavouriteRecipesToggleComponent,
    InfoMessageComponent
  ],
  templateUrl: './recipe-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:keydown)': 'handleKeyboardEvents($event)',
  },
})
export class RecipeListComponent {

  readonly pageNumber = signal(INITIAL_PAGE_NUMBER);
  readonly pageSize = signal(DEFAULT_PAGE_SIZE);
  readonly onlyFavourites = signal(false);
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  readonly dietTypes = signal(Object.values(DietType));
  readonly mealTypes = signal(Object.values(MealType));

  readonly filters = signal<RecipeFilters>({
    name: '',
    ingredient: '',
    diet: '',
    meal: '',
    sort: '',
  });

  readonly sortOptions: Option[] = [
    {value: '', label: 'Default'},
    {value: 'favouritesCount,desc', label: 'Most Popular'},
    {value: 'favouritesCount,asc', label: 'Least Popular'},
    {value: 'name,asc', label: 'Name (A-Z)'},
    {value: 'name,desc', label: 'Name (Z-A)'},
    {value: 'calories,asc', label: 'Calories (Low to High)'},
    {value: 'calories,desc', label: 'Calories (High to Low)'},
  ];
  readonly startIndex = computed(() => (this.pageNumber() - INITIAL_PAGE_NUMBER) * this.pageSize());
  private readonly recipeService = inject(RecipeService);
  private readonly refetchTrigger = signal(0);
  private readonly recipeSearchParams = computed<RecipeSearchParams>(() => {
    const currentFilters = this.filters();
    return {
      name: currentFilters.name,
      ingredient: currentFilters.ingredient,
      diet: currentFilters.diet,
      meal: currentFilters.meal,
      sort: currentFilters.sort,
      page: (this.pageNumber() - INITIAL_PAGE_NUMBER) + BACKEND_INITIAL_PAGE_INDEX,
      size: this.pageSize(),
      onlyFavourites: this.onlyFavourites(),
      _trigger: this.refetchTrigger()
    };
  });
  private readonly state = toSignal(
    toObservable(this.recipeSearchParams).pipe(
      switchMap(params => this.recipeService.getAll(params).pipe(
        map(page => ({
          page: page,
          loading: false,
          error: null
        })),
        catchError((err: unknown) => {
          console.error(err);
          return of({
            page: initialPage,
            loading: false,
            error: 'Failed to load recipes.'
          });
        })
      )),
      startWith(initialState)
    ),
    {initialValue: initialState}
  );
  readonly isLoading = computed(() => this.state().loading);
  readonly errorMessage = computed(() => this.state().error);
  readonly pageItems = computed(() => this.state().page.content);
  readonly endIndex = computed(() => this.startIndex() + this.pageItems().length);
  readonly totalRecipeCount = computed(() => this.state().page.totalElements);
  readonly totalPages = computed(() => {
    return Math.max(INITIAL_PAGE_NUMBER, this.state().page.totalPages)
  });

  handleFiltersChange(newFilters: RecipeFilters): void {
    this.filters.set(newFilters);
    this.pageNumber.set(INITIAL_PAGE_NUMBER);
  }

  nextPage(): void {
    if (this.pageNumber() < this.totalPages()) this.pageNumber.update(p => p + 1);
  }

  prevPage(): void {
    if (this.pageNumber() > INITIAL_PAGE_NUMBER) this.pageNumber.update(p => p - 1);
  }

  handleKeyboardEvents(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    const targetTagName = target.tagName.toUpperCase();

    if (targetTagName === 'INPUT' || targetTagName === 'SELECT') {
      return;
    }

    switch (event.key) {
      case KeyboardKey.ARROW_LEFT:
        this.prevPage();
        break;
      case KeyboardKey.ARROW_RIGHT:
        this.nextPage();
        break;
    }
  }

  handleOnlyFavouritesChange(isChecked: boolean): void {
    this.onlyFavourites.set(isChecked);
    this.pageNumber.set(INITIAL_PAGE_NUMBER);
  }

  handlePageSizeChange(newSize: number): void {
    this.pageSize.set(newSize);
    this.pageNumber.set(INITIAL_PAGE_NUMBER);
  }

  handleFavouriteToggle(recipeId: number): void {
    const recipeToToggle = this.pageItems().find((r) => r.id === recipeId);
    if (!recipeToToggle) {
      return;
    }

    const newStatus = !recipeToToggle.isFavourite;

    const request$ = newStatus
      ? this.recipeService.addFavourite(recipeId)
      : this.recipeService.removeFavourite(recipeId);

    request$.pipe(catchError(() => EMPTY)).subscribe(() => {
      this.refetchTrigger.update(value => value + 1);
    });
  }
}
