import type {Signal, WritableSignal} from '@angular/core';
import {afterNextRender, ChangeDetectionStrategy, Component, computed, inject, signal,} from '@angular/core';
import {CommonModule, TitleCasePipe} from '@angular/common';
import type {Observable} from 'rxjs';
import {firstValueFrom, map} from 'rxjs';
import {DailyMealPlanComponent} from '../daily-meal-plan/daily-meal-plan.component';
import {DailyMealPlanTotalsComponent} from '../daily-meal-plan-totals/daily-meal-plan-totals.component';
import {MealPlanShoppingListComponent} from '../meal-plan-shopping-list/meal-plan-shopping-list.component';
import {MealPlanService} from '@core/services/mealplan/mealplan.service';
import {RecipeService} from '@core/services/recipe/recipe.service';
import type {MealPlanDto} from '@core/models/dto/mealplan.dto';
import type {RecipeDto} from '@core/models/dto/recipe.dto';
import type {MealPlanDayDto} from '@core/models/dto/mealplan-day.dto';
import {ShoppingListService} from '@core/services/shopping-list/shopping-list.service';
import {ErrorMessageComponent} from '@shared/components/error-message/error-message.component';
import {DietaryProfileService} from '@core/services/dietary-profile/dietary-profile.service';
import {ActivatedRoute, Router} from '@angular/router';
import type {DietaryProfileDto} from '@core/models/dto/dietaryprofile.dto';
import type {ShoppingList} from '@core/models/dto/shopping-list.dto';
import type {UpdateShoppingListItemPayload} from '@core/models/payloads/updateshoppinglistitem.payload';
import type {IngredientCategory} from '@core/models/enum/ingredient-category.enum';
import {LoadingMessageComponent} from '@shared/components/loading-message/loading-message.component';
import {toSignal} from "@angular/core/rxjs-interop";
import {SourceTagComponent} from "@features/mealplan/source-tag/source-tag.component";
import type {NutritionalInformation} from "@features/mealplan/mealplan.util";
import {downloadBlob, getMacrosForRecipe} from "@features/mealplan/mealplan.util";
import {setError} from "@shared/utils";

@Component({
  selector: 'app-mealplan',
  imports: [
    CommonModule,
    TitleCasePipe,
    DailyMealPlanComponent,
    DailyMealPlanTotalsComponent,
    MealPlanShoppingListComponent,
    ErrorMessageComponent,
    LoadingMessageComponent,
    SourceTagComponent,
  ],
  templateUrl: './mealplan.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealPlanComponent {
  readonly loading = signal(true);
  readonly downloadingMealPlanPdf = signal(false);
  readonly downloadingShoppingListPdf = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly selectedDayIndex = signal(0);
  readonly plan = signal<MealPlanDto | null>(null);
  readonly expandedRecipeIds = signal<ReadonlySet<number>>(new Set());
  readonly recipeDetails = signal<ReadonlyMap<number, RecipeDto>>(new Map());
  readonly shoppingList = signal<ShoppingList | null>(null);
  readonly shoppingListLoading = signal(true);
  readonly shoppingListError = signal<string | null>(null);
  readonly updatingShoppingListItemId = signal<string | null>(null);
  readonly loadingMessage = signal<string | null>(null);
  readonly days: Signal<readonly MealPlanDayDto[]> = computed(
    () => this.plan()?.days ?? [],
  );
  readonly selectedDay = computed(() => {
    const mealPlanDays: readonly MealPlanDayDto[] = this.days();
    const id = this.selectedDayIndex();
    return mealPlanDays[id] ?? null;
  });
  readonly dailyTotals = computed(() => {
    const day = this.selectedDay();
    return {
      calories: Math.round(day.totalCalories),
      carbs: Math.round(day.totalCarbs),
      protein: Math.round(day.totalProtein),
      fat: Math.round(day.totalFat),
    };
  });
  readonly recipeMacrosMap: Signal<ReadonlyMap<number, NutritionalInformation>> = computed(() => {
    const day = this.selectedDay();
    if (!day.recipes.length) return new Map<number, NutritionalInformation>();
    return new Map(
      day.recipes.map(({recipe}) => [recipe.id, getMacrosForRecipe(recipe)])
    );
  });
  readonly daysPerPage = 7;
  readonly currentWeekIndex = signal(0);
  readonly totalWeeks = computed(() =>
    Math.ceil(this.days().length / this.daysPerPage),
  );
  readonly weekStart = computed(() => this.currentWeekIndex() * this.daysPerPage);
  readonly visibleDays = computed(() => {
    const days = this.days();
    const start = this.weekStart();
    return days.slice(start, start + this.daysPerPage);
  });
  readonly canNavigateToPreviousWeek = computed(() => this.currentWeekIndex() > 0);
  readonly canNavigateToNextWeek = computed(
    () => this.currentWeekIndex() < this.totalWeeks() - 1,
  );
  readonly weekButtonClasses = `
  rounded-lg px-2 py-1.5 text-sm font-medium transition-all hover:cursor-pointer
  disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 hover:bg-emerald-100
  `;
  private readonly activatedRoute = inject(ActivatedRoute);
  protected readonly mealPlanIdSignal = toSignal(
    this.activatedRoute.paramMap.pipe(
      map((params) => Number(params.get('id')) || null))
  );
  private readonly mealPlanService = inject(MealPlanService);
  private readonly recipeService = inject(RecipeService);
  private readonly shoppingListService = inject(ShoppingListService);
  private readonly dietaryProfileService = inject(DietaryProfileService);
  private readonly router = inject(Router);
  private readonly profile = signal<DietaryProfileDto | null>(null);
  readonly dailyTargets = computed(() => {
    const dietaryProfile = this.profile();
    return {
      calories: Math.round(dietaryProfile?.calorieTarget ?? 0),
      carbs: Math.round(dietaryProfile?.carbsTarget ?? 0),
      protein: Math.round(dietaryProfile?.proteinTarget ?? 0),
      fat: Math.round(dietaryProfile?.fatTarget ?? 0),
    };
  });

  constructor() {
    afterNextRender(() => {
      this.fetchMealPlanData().catch((error: unknown) => {
        console.error(error);
      });
    })
  }

  async onGenerate(): Promise<void> {
    this.loading.set(true);
    this.loadingMessage.set('Generating meal plan, please wait...');
    this.errorMessage.set(null);
    this.expandedRecipeIds.set(new Set());
    this.recipeDetails.set(new Map());
    this.shoppingList.set(null);
    try {
      const res = await firstValueFrom(this.mealPlanService.generate());
      this.plan.set(res);
      this.selectedDayIndex.set(0);
      this.currentWeekIndex.set(0);
      await this.loadShoppingList(res.id);
    } catch (error: unknown) {
      setError(this.errorMessage, error, 'Failed to generate meal plan.');
    } finally {
      this.loading.set(false);
      this.loadingMessage.set(null);
    }
  }

  async onDownloadMealPlanPdf(planId: number): Promise<void> {
    await this.downloadPdf(
      planId,
      this.downloadingMealPlanPdf,
      'meal-plan',
      (id) => this.mealPlanService.downloadPdf(id),
    );
  }

  async onDownloadShoppingListPdf(planId: number): Promise<void> {
    await this.downloadPdf(
      planId,
      this.downloadingShoppingListPdf,
      'shopping-list',
      (id) => this.shoppingListService.downloadPdf(id),
    );
  }

  selectDay(i: number): void {
    this.selectedDayIndex.set(i);
    this.currentWeekIndex.set(Math.floor(i / this.daysPerPage));
    this.expandedRecipeIds.set(new Set());
  }

  async onToggleRecipe(recipeId: number): Promise<void> {
    this.expandedRecipeIds.update((prev) => {
      const next = new Set(prev);
      if (next.has(recipeId)) {
        next.delete(recipeId);
      } else {
        next.add(recipeId);
      }
      return next;
    });

    const detailsMap = this.recipeDetails();
    if (!detailsMap.has(recipeId)) {
      try {
        const dto = await firstValueFrom(this.recipeService.getById(recipeId));
        this.recipeDetails.update((prev) => {
          const next = new Map(prev);
          if (dto) {
            next.set(recipeId, dto);
          }
          return next;
        });
      } catch (error: unknown) {
        setError(this.errorMessage, error, 'Failed to load recipe details.');
      }
    }
  }

  async onToggleShoppingListItem(
    payload: UpdateShoppingListItemPayload,
  ): Promise<void> {
    if (this.updatingShoppingListItemId()) return;

    const planId = this.plan()?.id;
    const originalList = this.shoppingList();
    if (!planId || !originalList) return;

    this.updatingShoppingListItemId.set(payload.ingredientName);

    const toggledShoppingList = this.createToggledShoppingList(
      originalList,
      payload,
    );
    this.shoppingList.set(toggledShoppingList);

    try {
      await firstValueFrom(
        this.shoppingListService.updateItemStatus(planId, payload),
      );
    } catch (error: unknown) {
      setError(this.errorMessage, error, 'Failed to update shopping list. Please try again.');
      this.shoppingList.set(originalList);
    } finally {
      this.updatingShoppingListItemId.set(null);
    }
  }

  previousWeek(): void {
    if (this.canNavigateToPreviousWeek()) this.currentWeekIndex.update((i) => i - 1);
  }

  nextWeek(): void {
    if (this.canNavigateToNextWeek()) this.currentWeekIndex.update((i) => i + 1);
  }

  protected dayButtonClasses(index: number) {
    const selected = this.selectedDayIndex();
    return selected === index
      ? 'bg-emerald-600 text-white shadow-sm'
      : 'text-gray-600 hover:bg-emerald-100 hover:text-gray-800';
  };

  private async fetchMealPlanData(): Promise<void> {
    try {
      const profile = await this.getDietaryProfile();
      if (!profile) {
        await this.router.navigate(['/dietary-profile-form']);
        return;
      }
      const planId = this.mealPlanIdSignal();
      if (planId) {
        await this.loadPlanById(planId);
      } else {
        await this.loadLatestPlan()
      }
    } catch (error: unknown) {
      setError(this.errorMessage, error, 'Failed to fetch meal plan. Please try again.');
      if (!this.mealPlanIdSignal()) {
        await this.router.navigate(['/dietary-profile-form']);
      }
    }
  }

  private async downloadPdf(
    planId: number,
    loadingSignal: WritableSignal<boolean>,
    fileNamePrefix: string,
    requestFactory: (id: number) => Observable<Blob>,
  ): Promise<void> {
    loadingSignal.set(true);
    this.errorMessage.set(null);

    try {
      await downloadBlob(
        firstValueFrom(requestFactory(planId)),
        `${fileNamePrefix}-${planId}.pdf`,
      );
    } catch (error: unknown) {
      setError(this.errorMessage, error, `Failed to download ${fileNamePrefix} PDF.`);
    } finally {
      loadingSignal.set(false);
    }
  }

  private async loadLatestPlan(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set(null);

    try {
      const history = await firstValueFrom(this.mealPlanService.getHistory());
      if (history.length > 0) {
        const latest = history[history.length - 1];
        this.plan.set(latest);
        this.selectedDayIndex.set(0);
        this.currentWeekIndex.set(0);
        this.expandedRecipeIds.set(new Set());
        this.recipeDetails.set(new Map());
        await this.loadShoppingList(latest.id);
      }
    } catch (error: unknown) {
      setError(this.errorMessage, error, 'Failed to load your latest meal plan.');
    } finally {
      this.loading.set(false);
    }
  }

  private async loadPlanById(id: number): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set(null);

    try {
      const plan = await firstValueFrom(this.mealPlanService.getById(id));
      this.plan.set(plan);
      this.selectedDayIndex.set(0);
      this.currentWeekIndex.set(0);
      this.expandedRecipeIds.set(new Set());
      this.recipeDetails.set(new Map());
      await this.loadShoppingList(plan.id);
    } catch (error: unknown) {
      setError(this.errorMessage, error, 'Failed to load meal plan details.');
    } finally {
      this.loading.set(false);
    }
  }

  private async getDietaryProfile(): Promise<DietaryProfileDto | null> {
    const profile = await firstValueFrom(
      this.dietaryProfileService.getProfile(),
    );
    if (profile) {
      this.profile.set(profile);
    }
    return profile;
  }

  private createToggledShoppingList(
    originalList: ShoppingList, payload: UpdateShoppingListItemPayload
  ): ShoppingList {
    const categories = Object.keys(originalList.items) as IngredientCategory[];
    const newItems = {...originalList.items};

    for (const category of categories) {
      const originalItems = originalList.items[category];
      const itemIndex = originalItems.findIndex(
        (item) => item.name === payload.ingredientName
      );

      if (itemIndex === -1) {
        continue;
      }

      newItems[category] = originalItems.map((item, index) =>
        index === itemIndex ? {...item, isBought: payload.isBought} : item
      );
      break;
    }

    return {
      ...originalList,
      items: newItems,
    };
  }

  private async loadShoppingList(planId: number): Promise<void> {
    this.shoppingListLoading.set(true);
    this.shoppingListError.set(null);
    try {
      const list = await firstValueFrom(this.shoppingListService.getShoppingList(planId));
      this.shoppingList.set(list);
    } catch (error: unknown) {
      setError(this.shoppingListError, error, 'Could not load the shopping list.');
    } finally {
      this.shoppingListLoading.set(false);
    }
  }
}
