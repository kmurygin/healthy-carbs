import type {Signal} from '@angular/core';
import {afterNextRender, ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {CommonModule, TitleCasePipe} from '@angular/common';
import {firstValueFrom} from 'rxjs';
import {DailyMealPlanComponent} from "../daily-meal-plan/daily-meal-plan.component";
import {DailyMealPlanTotalsComponent} from "../daily-meal-plan-totals/daily-meal-plan-totals.component";
import {MealPlanShoppingListComponent} from "../meal-plan-shopping-list/meal-plan-shopping-list.component";
import {MealPlanService} from "../../../core/services/mealplan/mealplan.service";
import {RecipeService} from "../../../core/services/recipe/recipe.service";
import type {MealPlanDto} from "../../../core/models/dto/mealplan.dto";
import type {RecipeDto} from "../../../core/models/dto/recipe.dto";
import type {MealPlanDayDto} from "../../../core/models/dto/mealplan-day.dto";
import {ShoppingListService} from "../../../core/services/shopping-list/shopping-list.service";
import {ErrorMessageComponent} from "../../../shared/components/error-message/error-message.component";
import {DietaryProfileService} from "../../../core/services/dietary-profile/dietary-profile.service";
import {Router} from "@angular/router";
import type {DietaryProfileDto} from "../../../core/models/dto/dietaryprofile.dto";
import type {ShoppingList} from "../../../core/models/dto/shopping-list.dto";
import type {UpdateShoppingListItemPayload} from "../../../core/models/payloads/updateshoppinglistitem.payload";
import type {IngredientCategory} from "../../../core/models/enum/ingredient-category.enum";

type NutritionalInformation = Readonly<{ calories: number; carbs: number; protein: number; fat: number }>;

@Component({
  selector: 'app-mealplan',
  imports: [
    CommonModule,
    TitleCasePipe,
    DailyMealPlanComponent,
    DailyMealPlanTotalsComponent,
    MealPlanShoppingListComponent,
    ErrorMessageComponent,
  ],
  templateUrl: './mealplan.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealPlanComponent {
  readonly loading = signal(false);
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
  readonly days: Signal<readonly MealPlanDayDto[]> = computed(() => this.plan()?.days ?? []);
  readonly selectedDay = computed(() => {
    const mealPlanDays: readonly MealPlanDayDto[] = this.days();
    const id = this.selectedDayIndex();
    return mealPlanDays[id] ?? null;
  });
  readonly dailyTotals = computed(() => {
    const day = this.selectedDay();
    if (!day) return {calories: 0, carbs: 0, protein: 0, fat: 0};
    return {
      calories: Math.round(day.totalCalories ?? 0),
      carbs: Math.round(day.totalCarbs ?? 0),
      protein: Math.round(day.totalProtein ?? 0),
      fat: Math.round(day.totalFat ?? 0),
    };
  });
  readonly recipeMacrosMap: Signal<ReadonlyMap<number, NutritionalInformation>> = computed(() => {
    const day = this.selectedDay();
    const macrosMap = new Map<number, NutritionalInformation>();
    if (!day) return macrosMap;

    for (const mealPlanRecipe of day.recipes ?? []) {
      const recipe = mealPlanRecipe.recipe;
      macrosMap.set(recipe.id, this.getMacrosForRecipe(recipe));
    }

    return macrosMap;
  });
  private readonly mealPlanService = inject(MealPlanService);
  private readonly recipeService = inject(RecipeService);
  private readonly shoppingListService = inject(ShoppingListService);
  private readonly dietaryProfileService = inject(DietaryProfileService);
  private readonly router = inject(Router);
  private profile = signal<DietaryProfileDto | null>(null);
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
      this.fetchMealPlanData().catch(error => {
        console.error(error);
      });
    })
  }

  async onGenerate(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.expandedRecipeIds.set(new Set());
    this.recipeDetails.set(new Map());
    this.shoppingList.set(null);
    try {
      const res = await firstValueFrom(this.mealPlanService.generate());
      this.plan.set(res);
      this.selectedDayIndex.set(0);
      await this.loadShoppingList(res.id);
    } catch (error) {
      console.error('Failed to generate meal plan:', error);
      this.errorMessage.set('Failed to generate meal plan.');
    } finally {
      this.loading.set(false);
    }
  }

  async onDownloadMealPlanPdf(planId: number): Promise<void> {
    this.downloadingMealPlanPdf.set(true);
    this.errorMessage.set(null);

    try {
      const blob = await firstValueFrom(this.mealPlanService.downloadPdf(planId));
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `meal-plan-${planId}.pdf`;
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      this.errorMessage.set('Failed to download PDF.');
    } finally {
      this.downloadingMealPlanPdf.set(false);
    }
  }

  async onDownloadShoppingList(planId: number): Promise<void> {
    this.downloadingShoppingListPdf.set(true);
    this.errorMessage.set(null);

    try {
      const blob = await firstValueFrom(this.shoppingListService.downloadPdf(planId));
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `shopping-list-${planId}.pdf`;
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download shopping list:', error);
      this.errorMessage.set('Failed to download shopping list.');
    } finally {
      this.downloadingShoppingListPdf.set(false);
    }
  }

  selectDay(i: number): void {
    this.selectedDayIndex.set(i);
    this.expandedRecipeIds.set(new Set());
  }

  async onToggleRecipe(recipeId: number): Promise<void> {
    this.expandedRecipeIds.update(prev => {
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
        this.recipeDetails.update(prev => {
          const next = new Map(prev);
          if (dto) {
            next.set(recipeId, dto);
          }
          return next;
        });
      } catch (error) {
        console.error(error);
      }
    }
  }

  async onToggleShoppingListItem(payload: UpdateShoppingListItemPayload): Promise<void> {
    if (this.updatingShoppingListItemId()) return;

    const planId = this.plan()?.id;
    const originalList = this.shoppingList();
    if (!planId || !originalList) return;

    this.updatingShoppingListItemId.set(payload.ingredientName);

    const toggledShoppingList = this.createToggledShoppingList(originalList, payload);
    this.shoppingList.set(toggledShoppingList);

    try {
      await firstValueFrom(this.shoppingListService.updateItemStatus(planId, payload));
    } catch (error) {
      console.error("Failed to update item status:", error);
      this.shoppingList.set(originalList);
      this.errorMessage.set("Failed to update shopping list. Please try again.");
    } finally {
      this.updatingShoppingListItemId.set(null);
    }
  }

  private createToggledShoppingList(originalList: ShoppingList, payload: UpdateShoppingListItemPayload): ShoppingList {
    const categories = Object.keys(originalList.items) as IngredientCategory[];
    const newItems = {...originalList.items};

    for (const category of categories) {
      const originalItems = originalList.items[category];
      const itemIndex = originalItems.findIndex(item => item.name === payload.ingredientName);

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

  private getMacrosForRecipe(recipe: RecipeDto | undefined | null): NutritionalInformation {
    const defaultMacros = {calories: 0, carbs: 0, protein: 0, fat: 0};

    if (!recipe) {
      return defaultMacros;
    }

    return {
      calories: Math.round(recipe.calories),
      carbs: Math.round(recipe.carbs),
      protein: Math.round(recipe.protein),
      fat: Math.round(recipe.fat),
    };
  }

  private async loadShoppingList(planId: number): Promise<void> {
    this.shoppingListLoading.set(true);
    this.shoppingListError.set(null);
    try {
      const list = await firstValueFrom(this.shoppingListService.getShoppingList(planId));
      this.shoppingList.set(list);
    } catch (err) {
      console.error('Failed to load shopping list', err);
      this.shoppingListError.set('Could not load the shopping list.');
    } finally {
      this.shoppingListLoading.set(false);
    }
  }

  private async fetchMealPlanData(): Promise<void> {
    try {
      const profile = await this.getDietaryProfile();

      if (!profile) {
        await this.router.navigate(['/dietary-profile-form']);
      } else {
        await this.getMealPlan();
      }
    } catch (error) {
      console.error('Failed to fetch meal plan data:', error);
      this.errorMessage.set('Failed to fetch meal plan. Please try again.');
      await this.router.navigate(['/dietary-profile-form']);
    }
  }

  private async getDietaryProfile(): Promise<DietaryProfileDto | null> {
    const profile = await firstValueFrom(this.dietaryProfileService.getProfile());
    if (profile) {
      this.profile.set(profile);
    }
    return profile;
  }

  private async getMealPlan(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set(null);

    try {
      const history = await firstValueFrom(this.mealPlanService.getHistory());
      if (history.length > 0) {
        const latest = history[history.length - 1];
        this.plan.set(latest);
        this.selectedDayIndex.set(0);
        this.expandedRecipeIds.set(new Set());
        this.recipeDetails.set(new Map());
        await this.loadShoppingList(latest.id);
      }
    } catch (error) {
      console.error(error);
      this.errorMessage.set('Failed to load your latest meal plan.');
    } finally {
      this.loading.set(false);
    }
  }
}
