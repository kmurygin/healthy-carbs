import {ChangeDetectionStrategy, Component, computed, DestroyRef, DOCUMENT, inject, signal,} from '@angular/core';
import {CommonModule} from '@angular/common';
import {type CdkDragDrop, copyArrayItem, DragDropModule, transferArrayItem,} from '@angular/cdk/drag-drop';
import {ActivatedRoute, Router} from '@angular/router';
import {takeUntilDestroyed, toObservable, toSignal} from '@angular/core/rxjs-interop';
import {catchError, filter, firstValueFrom, map, of, shareReplay, startWith, switchMap, take,} from 'rxjs';
import {PageSizeSelectorComponent} from '@features/recipes-list/page-size-selector/page-size-selector.component';
import {PaginationControlsComponent} from '@features/recipes-list/pagination-controls/pagination-controls.component';
import {DailyMealPlanTotalsComponent} from '@features/mealplan/daily-meal-plan-totals/daily-meal-plan-totals.component';
import {
  MealPlanRecipeFilterComponent
} from '@features/dietitian/meal-plan-creator/meal-plan-recipe-filter/meal-plan-recipe-filter.component';
import {RecipeDetailsComponent} from '@features/dietitian/meal-plan-creator/recipe-details/recipe-details.component';
import {
  MealPlanCreatorRecipeCardComponent
} from '@features/dietitian/meal-plan-creator/meal-plan-creator-recipe-card/creator-recipe-card.component';
import {
  MealPlanCreatorPlacedRecipeCardComponent
} from '@features/dietitian/meal-plan-creator/meal-plan-creator-placed-recipe-card/meal-plan-creator-placed-recipe-card.component';
import {RecipeService} from '@core/services/recipe/recipe.service';
import {MealPlanService} from '@core/services/mealplan/mealplan.service';
import {DietitianService} from '@core/services/dietitian/dietitian.service';
import {NotificationService} from '@core/services/ui/notification.service';
import {ConfirmationService} from '@core/services/ui/confirmation.service';
import type {RecipeDto} from '@core/models/dto/recipe.dto';
import type {Option, RecipeFilters} from '@features/recipes-list/recipes-list.types';
import type {RecipeSearchParams} from '@core/models/recipe-search.params';
import {DietType} from '@core/models/enum/diet-type.enum';
import {MealType} from '@core/models/enum/meal-type.enum';
import {
  type CreatorDay,
  DAY_NAMES,
  type DayMacros,
  type DaySlots,
  emptyMacros,
  formatEnum,
  formatNumber,
  genderInfo,
  normalizeNumber,
  type ProfileChip,
  startOfWeekMonday
} from "@features/dietitian/meal-plan-creator/meal-plan-creator.util";
import {
  MealPlanCreatorHeaderComponent
} from "@features/dietitian/meal-plan-creator/meal-plan-creator-header/meal-plan-creator-header.component";

@Component({
  selector: 'app-meal-plan-creator',
  imports: [
    CommonModule,
    DragDropModule,
    MealPlanRecipeFilterComponent,
    PageSizeSelectorComponent,
    PaginationControlsComponent,
    DailyMealPlanTotalsComponent,
    MealPlanCreatorRecipeCardComponent,
    MealPlanCreatorPlacedRecipeCardComponent,
    RecipeDetailsComponent,
    MealPlanCreatorHeaderComponent,
  ],
  templateUrl: './meal-plan-creator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealPlanCreatorComponent {
  readonly dietTypes = signal(Object.values(DietType));
  readonly mealTypes = signal(Object.values(MealType));

  readonly sortOptions = signal<readonly Option[]>([
    {label: 'Name (A–Z)', value: 'name,asc'},
    {label: 'Name (Z–A)', value: 'name,desc'},
    {label: 'Calories (Low → High)', value: 'calories,asc'},
    {label: 'Calories (High → Low)', value: 'calories,desc'},
  ]);

  readonly filters = signal<RecipeFilters>({
    name: '',
    ingredient: '',
    diet: '',
    meal: '',
    sort: '',
  });

  readonly pageNumber = signal(0);
  readonly pageSize = signal(10);
  readonly pageSizeOptions = [10, 20, 50] as const;
  readonly selectedRecipe = signal<RecipeDto | null>(null);
  readonly startDate = signal<Date>(startOfWeekMonday(new Date()));
  readonly planDays = signal<CreatorDay[]>(this.initializeWeek(this.startDate()));
  readonly isRecipeLibraryOpen = signal(false);
  readonly selectedRecipeForPlacement = signal<RecipeDto | null>(null);
  readonly selectedRecipeForPlacementId = computed(
    () => this.selectedRecipeForPlacement()?.id ?? null
  );

  readonly isCoarsePointer = signal(false);

  readonly isPlanComplete = computed(() => {
    const currentDays = this.planDays();
    const availableMealTypes = this.mealTypes();

    return currentDays.every((creatorDay) =>
      availableMealTypes.every((mealType) => creatorDay.slots[mealType].length > 0)
    );
  });
  readonly recipesList = signal<RecipeDto[]>([]);
  readonly totalPages = signal(0);
  readonly recipesLoadingMore = signal(false);
  readonly canLoadMoreRecipes = signal(true);
  readonly selectedDayIndex = signal(0);
  readonly totalDays = computed(() => this.planDays().length);
  readonly currentDay = computed<CreatorDay | null>(() => {
    const days = this.planDays();
    const idx = this.selectedDayIndex();
    return days[idx] ?? null;
  });
  readonly showAllDays = signal(false);
  readonly completedDayIndexes = computed<Set<number>>(() => {
    const days = this.planDays();
    const mealTypes = this.mealTypes();

    const complete = new Set<number>();

    days.forEach((day, idx) => {
      const isComplete = mealTypes.every((mt) => day.slots[mt].length > 0);
      if (isComplete) complete.add(idx);
    });

    return complete;
  });
  readonly recipesRefreshing = signal(false);
  private readonly recipeService = inject(RecipeService);
  private readonly mealPlanService = inject(MealPlanService);
  private readonly dietitianService = inject(DietitianService);
  private readonly activatedRoute = inject(ActivatedRoute);
  readonly clientId = toSignal(
    this.activatedRoute.paramMap.pipe(
      map((routeParams) => {
        const clientIdParam = routeParams.get('clientId');
        return clientIdParam ? Number(clientIdParam) : null;
      })
    ),
    {initialValue: null}
  );
  readonly dietaryProfile = toSignal(
    toObservable(this.clientId).pipe(
      filter(
        (clientIdentifier): clientIdentifier is number =>
          typeof clientIdentifier === 'number' && Number.isFinite(clientIdentifier)
      ),
      switchMap((clientIdentifier) =>
        this.dietitianService.getClientDietaryProfile(clientIdentifier)
      ),
      startWith(null),
      catchError(() => of(null))
    ),
    {initialValue: null}
  );
  readonly targets = computed<DayMacros>(() => {
    const currentProfile = this.dietaryProfile();
    if (!currentProfile) return emptyMacros();

    return {
      calories: normalizeNumber(currentProfile.calorieTarget),
      carbs: normalizeNumber(currentProfile.carbsTarget),
      protein: normalizeNumber(currentProfile.proteinTarget),
      fat: normalizeNumber(currentProfile.fatTarget),
    };
  });
  readonly profileChips = computed<ProfileChip[]>(() => {
    const profile = this.dietaryProfile();
    if (!profile) return [];

    const gender = genderInfo(profile.gender);
    const fullName = `${profile.user.firstName} ${profile.user.lastName}`;

    return [
      {
        iconClass: 'fa-solid fa-user',
        label: 'Client',
        value: fullName,
      },
      {iconClass: 'fa-solid fa-weight-scale', label: 'Weight', value: formatNumber(profile.weight, 'kg')},
      {iconClass: 'fa-solid fa-ruler-vertical', label: 'Height', value: formatNumber(profile.height, 'cm')},
      {iconClass: 'fa-solid fa-calendar-days', label: 'Age', value: formatNumber(profile.age, '')},
      {iconClass: gender.iconClass, label: 'Gender', value: gender.label},
      {iconClass: 'fa-solid fa-bullseye', label: 'Goal', value: formatEnum(profile.dietGoal)},
      {iconClass: 'fa-solid fa-leaf', label: 'Diet', value: formatEnum(profile.dietType)},
      {iconClass: 'fa-solid fa-person-running', label: 'Activity', value: formatEnum(profile.activityLevel)},
      {iconClass: 'fa-solid fa-fire', label: 'Target', value: `${normalizeNumber(profile.calorieTarget)} kcal`},
    ];
  });
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly notificationService = inject(NotificationService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly recipeSearchParams = computed<RecipeSearchParams>(() => ({
    ...this.filters(),
    page: this.pageNumber(),
    size: this.pageSize(),
  }));
  private readonly recipesPageStream$ = toObservable(this.recipeSearchParams).pipe(
    switchMap((searchParams) => this.recipeService.getAll(searchParams)),
    shareReplay({bufferSize: 1, refCount: true})
  );
  private readonly loadTriggerPx = 120;
  private readonly baseRecipeParams = computed(() => ({
    ...this.filters(),
    size: this.pageSize(),
  }));

  constructor() {
    this.initializePointerDetection();

    toObservable(this.baseRecipeParams)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        void this.resetAndLoadRecipes();
      });
  }

  openRecipeLibrary(): void {
    this.isRecipeLibraryOpen.set(true);
    this.lockBodyScroll(true);
  }

  closeRecipeLibrary(): void {
    this.isRecipeLibraryOpen.set(false);
    this.lockBodyScroll(false);
  }

  toggleRecipeLibrary(): void {
    if (this.isRecipeLibraryOpen()) {
      this.closeRecipeLibrary();
    } else {
      this.openRecipeLibrary();
    }
  }

  onSelectRecipeForPlacement(recipeToPlace: RecipeDto): void {
    this.selectedRecipeForPlacement.set(recipeToPlace);
    this.closeRecipeLibrary();
  }

  async onSlotTapToPlace(dayIndex: number, targetMealType: MealType): Promise<void> {
    const recipeToPlace = this.selectedRecipeForPlacement();
    if (!recipeToPlace) return;

    if (recipeToPlace.mealType !== targetMealType) {
      this.notificationService.error(
        `This recipe is "${recipeToPlace.mealType}" — choose the "${targetMealType}" slot.`,
        3000
      );
      return;
    }

    const currentDays = this.planDays();
    const dayToUpdate = currentDays[dayIndex];
    const targetSlotRecipes = dayToUpdate.slots[targetMealType];
    const slotAlreadyFilled = targetSlotRecipes.length > 0;

    if (slotAlreadyFilled) {
      const shouldReplaceExistingRecipe = await firstValueFrom(
        this.confirmationService
          .confirm({
            message: 'Replace the existing recipe in this slot?',
            title: 'Replace recipe',
            type: 'info',
          })
          .pipe(take(1))
      );

      if (!shouldReplaceExistingRecipe) return;
    }

    this.planDays.update((creatorDays) =>
      creatorDays.map((creatorDay, currentDayIndex) => {
        if (currentDayIndex !== dayIndex) return creatorDay;

        return {
          ...creatorDay,
          slots: {
            ...creatorDay.slots,
            [targetMealType]: [{...recipeToPlace}],
          },
        };
      })
    );

    this.selectedRecipeForPlacement.set(null);
    this.recalculateMacros();
  }

  getSlotId(dayIndex: number, mealType: MealType): string {
    return `day-${dayIndex}-${mealType}`;
  }

  openRecipeDetails(recipeToOpen: RecipeDto, event?: Event): void {
    event?.stopPropagation();
    this.selectedRecipe.set(recipeToOpen);
  }

  closeRecipeDetails(): void {
    this.selectedRecipe.set(null);
  }

  handleFiltersChange(updatedFilters: RecipeFilters): void {
    this.filters.set(updatedFilters);
  }

  onPageSizeChange(updatedPageSize: number): void {
    this.pageSize.set(updatedPageSize);
  }

  onNextPage(): void {
    const totalAvailablePages = this.totalPages();
    this.pageNumber.update((currentPage) =>
      currentPage + 1 < totalAvailablePages ? currentPage + 1 : currentPage
    );
  }

  onPreviousPage(): void {
    this.pageNumber.update((currentPage) => (currentPage > 0 ? currentPage - 1 : 0));
  }

  async dropToSlot(
    dropEvent: CdkDragDrop<RecipeDto[]>,
    targetMealType: MealType
  ): Promise<void> {
    if (dropEvent.previousContainer === dropEvent.container) return;

    const draggedRecipeUnknown: unknown = dropEvent.item.data;
    if (!draggedRecipeUnknown || typeof draggedRecipeUnknown !== 'object') return;

    const draggedRecipe = draggedRecipeUnknown as RecipeDto;

    if (draggedRecipe.mealType !== targetMealType) {
      this.notificationService.error(
        `Error: You can’t add "${draggedRecipe.mealType}" to "${targetMealType}".`,
        3000
      );
      return;
    }

    const targetSlotRecipes = dropEvent.container.data;

    if (targetSlotRecipes.length > 0) {
      const shouldReplaceExistingRecipe = await firstValueFrom(
        this.confirmationService
          .confirm({
            message: 'Replace the existing recipe in this slot?',
            title: 'Replace recipe',
            type: 'info',
          })
          .pipe(take(1))
      );

      if (!shouldReplaceExistingRecipe) return;

      targetSlotRecipes.splice(0, targetSlotRecipes.length);
    }

    const isDroppingFromLibrary = dropEvent.previousContainer.id === 'recipe-library';

    if (isDroppingFromLibrary) {
      copyArrayItem(
        dropEvent.previousContainer.data,
        targetSlotRecipes,
        dropEvent.previousIndex,
        0
      );
    } else {
      transferArrayItem(
        dropEvent.previousContainer.data,
        targetSlotRecipes,
        dropEvent.previousIndex,
        0
      );
    }

    if (targetSlotRecipes.length > 1) targetSlotRecipes.splice(1);

    this.recalculateMacros();
  }

  removeRecipeFromSlot(dayIndex: number, mealType: MealType): void {
    this.planDays.update((currentDays) =>
      currentDays.map((creatorDay, currentDayIndex) => {
        if (currentDayIndex !== dayIndex) return creatorDay;

        return {
          ...creatorDay,
          slots: {
            ...creatorDay.slots,
            [mealType]: [],
          },
        };
      })
    );

    this.recalculateMacros();
  }

  async savePlan(): Promise<void> {
    const currentClientId = this.clientId();
    if (!currentClientId) {
      this.notificationService.error('Missing client ID.', 3000);
      return;
    }

    if (!this.isPlanComplete()) {
      this.notificationService.error('The plan is not complete.', 3000);
      return;
    }

    const requestedMealTypes = this.mealTypes();

    const daysPayload = this.planDays().map((creatorDay, dayOffset) => {
      const recipeIds: number[] = [];

      for (const mealType of requestedMealTypes) {
        const recipesInSlot = creatorDay.slots[mealType];
        const firstRecipeInSlot = recipesInSlot.length > 0 ? recipesInSlot[0] : null;

        if (firstRecipeInSlot && typeof firstRecipeInSlot.id === 'number') {
          recipeIds.push(firstRecipeInSlot.id);
        }
      }

      return {dayOffset, recipeIds};
    });

    const requestPayload = {
      clientId: currentClientId,
      startDate: this.startDate().toISOString().split('T')[0],
      days: daysPayload,
    };

    try {
      await firstValueFrom(this.mealPlanService.createManual(requestPayload).pipe(take(1)));
      this.notificationService.success('Meal plan saved successfully!', 3000);
      await this.router.navigate(['/dietitian/clients']);
    } catch {
      this.notificationService.error('Failed to save the meal plan.', 3000);
    }
  }

  prevDay(): void {
    this.selectedDayIndex.update((i) => Math.max(0, i - 1));
  }

  nextDay(): void {
    this.selectedDayIndex.update((i) => Math.min(this.totalDays() - 1, i + 1));
  }

  goToDay(index: number): void {
    this.selectedDayIndex.set(index);
  }

  onRecipeLibraryScroll(event: Event): void {
    const element = event.target as HTMLElement;

    const distanceToEnd = element.scrollWidth - (element.scrollLeft + element.clientWidth);
    if (distanceToEnd > this.loadTriggerPx) return;

    void this.tryLoadNextRecipesPage();
  }

  toggleShowAllDays(): void {
    this.showAllDays.update(v => !v);
  }

  private initializePointerDetection(): void {
    const mediaQueryList =
      window.matchMedia('(any-pointer: coarse), (pointer: coarse), (hover: none)');

    const updatePointerSignal = (): void => {
      this.isCoarsePointer.set(mediaQueryList.matches);
    };

    updatePointerSignal();

    const handleChange = (): void => {
      updatePointerSignal()
    };
    mediaQueryList.addEventListener('change', handleChange);

    this.destroyRef.onDestroy(() => {
      mediaQueryList.removeEventListener('change', handleChange);
    });
  }

  private lockBodyScroll(shouldLock: boolean): void {
    const bodyStyle = this.document.body.style;
    bodyStyle.overflow = shouldLock ? 'hidden' : '';
    bodyStyle.touchAction = shouldLock ? 'none' : '';
  }

  private initializeWeek(startDateInput: Date): CreatorDay[] {
    const mondayStartDate = startOfWeekMonday(startDateInput);

    return Array.from({length: 7}, (_, dayOffset) => {
      const currentDate = new Date(mondayStartDate);
      currentDate.setDate(mondayStartDate.getDate() + dayOffset);

      return {
        date: currentDate,
        dayName: DAY_NAMES[currentDate.getDay()],
        slots: this.createEmptySlots(),
        macros: emptyMacros(),
      };
    });
  }

  private createEmptySlots(): DaySlots {
    const emptySlots: Partial<DaySlots> = {};

    for (const mealType of Object.values(MealType)) {
      emptySlots[mealType] = [];
    }

    return emptySlots as DaySlots;
  }

  private recalculateMacros(): void {
    this.planDays.update((currentDays) =>
      currentDays.map((creatorDay) => {
        let totalCalories = 0;
        let totalCarbs = 0;
        let totalProtein = 0;
        let totalFat = 0;

        for (const recipesInSlot of Object.values(creatorDay.slots)) {
          for (const recipeInSlot of recipesInSlot) {
            totalCalories += normalizeNumber(recipeInSlot.calories);
            totalCarbs += normalizeNumber(recipeInSlot.carbs);
            totalProtein += normalizeNumber(recipeInSlot.protein);
            totalFat += normalizeNumber(recipeInSlot.fat);
          }
        }

        return {
          ...creatorDay,
          macros: {
            calories: totalCalories,
            carbs: totalCarbs,
            protein: totalProtein,
            fat: totalFat,
          },
        };
      })
    );
  }

  private async fetchRecipesPage(page: number): Promise<{
    items: readonly RecipeDto[];
    pageNumber: number;
    totalPages: number;
  }> {
    const params: RecipeSearchParams = {
      ...(this.filters() as any),
      page,
      size: this.pageSize(),
    };

    const pageResp = await firstValueFrom(
      this.recipeService.getAll(params).pipe(take(1))
    );

    return {
      items: pageResp.content,
      pageNumber: pageResp.number,
      totalPages: pageResp.totalPages,
    };
  }

  private async loadPage(page: number, mode: 'replace' | 'append'): Promise<void> {
    if (this.recipesLoadingMore()) return;

    this.recipesLoadingMore.set(true);
    try {
      const result = await this.fetchRecipesPage(page);

      this.totalPages.set(result.totalPages);
      this.pageNumber.set(result.pageNumber);

      const incoming = [...result.items];
      if (mode === 'replace') {
        this.recipesList.set(incoming);
      } else {
        const existingIds = new Set(this.recipesList().map((r) => r.id));
        const appended = incoming.filter((r) => !existingIds.has(r.id));
        this.recipesList.set([...this.recipesList(), ...appended]);
      }

      const isLast =
        result.totalPages === 0 || result.pageNumber >= result.totalPages - 1;
      this.canLoadMoreRecipes.set(!isLast);
    } catch {
      this.notificationService.error('Failed to load recipes.', 2500);
    } finally {
      this.recipesLoadingMore.set(false);
    }
  }

  private async resetAndLoadRecipes(): Promise<void> {
    this.recipesRefreshing.set(true);

    this.canLoadMoreRecipes.set(true);
    this.totalPages.set(0);
    this.pageNumber.set(0);

    try {
      const first = await this.fetchRecipesPage(0);

      this.totalPages.set(first.totalPages);
      this.pageNumber.set(first.pageNumber);
      this.recipesList.set([...first.items]);

      const isLast = first.totalPages === 0 || first.pageNumber >= first.totalPages - 1;
      this.canLoadMoreRecipes.set(!isLast);
    } catch {
      this.notificationService.error('Failed to load recipes.', 2500);
    } finally {
      this.recipesRefreshing.set(false);
    }
  }

  private async tryLoadNextRecipesPage(): Promise<void> {
    if (this.recipesLoadingMore()) return;
    if (!this.canLoadMoreRecipes()) return;

    const nextPage = this.pageNumber() + 1;

    if (this.totalPages() > 0 && nextPage >= this.totalPages()) {
      this.canLoadMoreRecipes.set(false);
      return;
    }

    await this.loadPage(nextPage, 'append');
  }


}
