import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {catchError, combineLatest, map, of, startWith, Subject, switchMap} from 'rxjs';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faCarrot, faExclamationCircle, faPlus, faSpinner} from '@fortawesome/free-solid-svg-icons';

import {IngredientService} from '@core/services/ingredient/ingredient.service';
import type {IngredientDto} from '@core/models/dto/ingredient.dto';
import type {Page} from '@core/models/page.model';
import type {IngredientSearchParams} from '@core/models/ingredient-search.params';
import {AbstractManagementComponent} from '@shared/components/abstract-management/abstract-management.component';
import {PaginationControlsComponent} from '../../recipes-list/pagination-controls/pagination-controls.component';
import {
  DietitianIngredientsFormComponent
} from '@features/dietitian/dietitian-ingredients-form/dietitian-ingredients-form.component';
import {
  DietitianIngredientsTableComponent
} from '@features/dietitian/dietitian-ingredients-table/dietitian-ingredients-table.component';
import {IngredientCategory} from "@core/models/enum/ingredient-category.enum";
import {AuthService} from "@core/services/auth/auth.service";
import {IngredientFilterComponent} from "@features/dietitian/ingredient-filter/ingredient-filter.component";
import type {IngredientFilters} from "@features/dietitian/ingredient-filter/ingredient-filter.component";
import {
  DietitianIngredientsMobileListComponent
} from "@features/dietitian/dietitian-ingredients-mobile-list/dietitian-ingredients-mobile-list.component";

const DEFAULT_PAGE_SIZE = 10;
const INITIAL_PAGE_INDEX = 0;

const EMPTY_PAGE: Page<IngredientDto> = {
  content: [], totalPages: 0, totalElements: 0, size: DEFAULT_PAGE_SIZE,
  number: INITIAL_PAGE_INDEX, first: true, last: true, empty: true
};

interface IngredientsState {
  page: Page<IngredientDto>;
  loading: boolean;
  error: string | null;
}

@Component({
  selector: 'app-dietitian-ingredients',
  imports: [
    CommonModule,
    FontAwesomeModule,
    DietitianIngredientsFormComponent,
    DietitianIngredientsTableComponent,
    DietitianIngredientsMobileListComponent,
    PaginationControlsComponent,
    IngredientFilterComponent
  ],
  templateUrl: './dietitian-ingredients.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DietitianIngredientsComponent extends AbstractManagementComponent<IngredientDto> {
  readonly categories = Object.values(IngredientCategory);
  protected readonly icons = {
    spinner: faSpinner,
    plus: faPlus,
    carrot: faCarrot,
    warn: faExclamationCircle
  };
  private readonly ingredientService = inject(IngredientService);
  private readonly authService = inject(AuthService);
  readonly currentUserId = this.authService.userId;
  private readonly pageIndex = signal(INITIAL_PAGE_INDEX);
  private readonly refreshTrigger$ = new Subject<void>();
  private readonly currentFilters = signal<IngredientFilters>({name: '', category: null, onlyMine: false});

  private readonly searchParams$ = combineLatest({
    page: toObservable(this.pageIndex),
    filters: toObservable(this.currentFilters),
    refresh: this.refreshTrigger$.pipe(startWith(undefined))
  }).pipe(
    map(({page, filters}): IngredientSearchParams => ({
      page,
      size: DEFAULT_PAGE_SIZE,
      name: filters.name || null,
      category: filters.category ?? null,
      onlyMine: filters.onlyMine
    }))
  );

  protected readonly state = toSignal(
    this.searchParams$.pipe(
      switchMap((params) =>
        this.ingredientService.getAllPage(params).pipe(
          map((page) => (
            {page: page ?? EMPTY_PAGE, loading: false, error: null}
          )),
          catchError((err) => {
            console.error(err);
            return of({
              page: EMPTY_PAGE,
              loading: false,
              error: 'Failed to load ingredients.'
            });
          })
        )
      ),
      startWith({page: EMPTY_PAGE, loading: true, error: null} as IngredientsState)
    ),
    {initialValue: {page: EMPTY_PAGE, loading: true, error: null}}
  );

  readonly ingredients = computed(() => this.state().page.content);
  readonly totalPages = computed(() => this.state().page.totalPages);
  readonly currentPage = computed(() => this.state().page.number);

  readonly isDataLoading = computed(() => this.state().loading);
  readonly errorMessage = computed(() => this.state().error);

  handleFilterChange(filters: IngredientFilters): void {
    this.currentFilters.set(filters);
    this.pageIndex.set(INITIAL_PAGE_INDEX);
  }

  override reloadData(): void {
    this.refreshTrigger$.next();
  }

  override deleteItem(id: number): void {
    this.confirmAndDelete(id, 'Ingredient', this.ingredientService.delete(id));
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) this.pageIndex.update(c => c + 1);
  }

  prevPage(): void {
    if (this.currentPage() > 0) this.pageIndex.update(c => c - 1);
  }
}
