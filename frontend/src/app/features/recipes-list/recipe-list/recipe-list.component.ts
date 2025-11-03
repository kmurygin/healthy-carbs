import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {RecipeService} from '../../../core/services/recipe/recipe.service';
import type {RecipeDto} from '../../../core/models/dto/recipe.dto';
import {toObservable, toSignal} from "@angular/core/rxjs-interop";
import {catchError, map, of, startWith, switchMap} from "rxjs";
import type {Page} from "../../../core/models/page.model";
import {RecipeCardComponent} from "../recipe-card/recipe-card.component";
import type {RecipeSearchParams} from "../../../core/models/recipe-search.params";
import {DietType} from "../../../core/models/enum/diet-type.enum";
import {MealType} from "../../../core/models/enum/meal-type.enum";
import {formatEnum} from "../../../shared/utils";
import {KeyboardKey} from "../../../shared/keyboard-key.enum";
import {FilterType} from "../filter-type.enum";

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
  imports: [CommonModule, RouterModule, RecipeCardComponent],
  templateUrl: './recipe-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:keydown)': 'handleKeyboardEvents($event)',
  },
})
export class RecipeListComponent {

  readonly nameFilter = signal('');
  readonly ingredientFilter = signal('');
  readonly dietFilter = signal('');
  readonly mealFilter = signal('');
  readonly pageNumber = signal(INITIAL_PAGE_NUMBER);
  readonly pageSize = signal(DEFAULT_PAGE_SIZE);
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  readonly dietTypes = signal(Object.values(DietType));
  readonly mealTypes = signal(Object.values(MealType));
  readonly startIndex = computed(() => (this.pageNumber() - INITIAL_PAGE_NUMBER) * this.pageSize());
  protected readonly formatEnum = formatEnum;
  protected readonly FilterType = FilterType;
  private readonly recipeService = inject(RecipeService);
  private readonly recipeSearchParams = computed<RecipeSearchParams>(() => ({
    name: this.nameFilter(),
    ingredient: this.ingredientFilter(),
    diet: this.dietFilter(),
    meal: this.mealFilter(),
    page: (this.pageNumber() - INITIAL_PAGE_NUMBER) + BACKEND_INITIAL_PAGE_INDEX,
    size: this.pageSize(),
  }));
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
  readonly totalPages = computed(() => Math.max(INITIAL_PAGE_NUMBER, this.state().page.totalPages));

  updateFilter(type: FilterType, event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLSelectElement).value;
    switch (type) {
      case FilterType.NAME:
        this.nameFilter.set(value);
        break;
      case FilterType.INGREDIENT:
        this.ingredientFilter.set(value);
        break;
      case FilterType.DIET_TYPE:
        this.dietFilter.set(value);
        break;
      case FilterType.MEAL_TYPE:
        this.mealFilter.set(value);
        break;
    }
    this.pageNumber.set(INITIAL_PAGE_NUMBER);
  }

  onPageSizeChange(event: Event): void {
    const value = parseInt((event.target as HTMLSelectElement).value, 10);
    this.pageSize.set(value);
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
}
