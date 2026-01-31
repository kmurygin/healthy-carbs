import {ChangeDetectionStrategy, Component, computed, inject, type Signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {catchError, map, of, startWith} from 'rxjs';
import {MealPlanService} from '@core/services/mealplan/mealplan.service';
import {DietaryProfileService} from '@core/services/dietary-profile/dietary-profile.service';
import {DashboardDailyTotalsComponent} from '../dashboard-daily-totals/dashboard-daily-totals.component';
import {DashboardRecipeCardComponent} from '../dashboard-recipe-card/dashboard-recipe-card.component';
import type {MealPlanDayDto} from '@core/models/dto/mealplan-day.dto';
import type {DailyNutrientTotals} from "@core/models/dashboard.model";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faChevronRight} from "@fortawesome/free-solid-svg-icons";

interface MealPlanState {
  status: 'loading' | 'success' | 'error' | 'empty';
  data?: MealPlanDayDto | null;
  error?: string;
}

@Component({
  selector: 'app-meal-plan-info',
  imports: [
    CommonModule,
    RouterLink,
    DashboardDailyTotalsComponent,
    DashboardRecipeCardComponent,
    FaIconComponent
  ],
  templateUrl: './meal-plan-info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealPlanInfoComponent {
  readonly dailyTotals = computed<DailyNutrientTotals>(() => {
    const day = this.dailyPlan();
    if (!day) return {calories: 0, carbs: 0, protein: 0, fat: 0};
    return {
      calories: Math.round(day.totalCalories),
      carbs: Math.round(day.totalCarbs),
      protein: Math.round(day.totalProtein),
      fat: Math.round(day.totalFat)
    };
  });
  protected readonly faChevronRight = faChevronRight;
  private readonly mealPlanService = inject(MealPlanService);
  private readonly dietaryProfileService = inject(DietaryProfileService);
  readonly dietaryProfile = toSignal(this.dietaryProfileService.getProfile());
  readonly dailyTargets = computed<DailyNutrientTotals>(() => {
    const profile = this.dietaryProfile();
    if (!profile) return {calories: 0, carbs: 0, protein: 0, fat: 0};
    return {
      calories: Math.round(profile.calorieTarget),
      carbs: Math.round(profile.carbsTarget),
      protein: Math.round(profile.proteinTarget),
      fat: Math.round(profile.fatTarget)
    };
  });
  private readonly INITIAL_STATE: MealPlanState = {status: 'loading'};
  readonly state: Signal<MealPlanState> = toSignal(
    this.mealPlanService.getHistory().pipe(
      map((history): MealPlanState => {
        const latestPlan = history.at(-1);
        if (!latestPlan) {
          return {status: 'empty', data: null};
        }

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const dayOfMonth = String(now.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${dayOfMonth}`;

        const currentDayPlan = latestPlan.days.find(
          mealPlanDate => mealPlanDate.date === todayStr
        );

        return {
          status: currentDayPlan ? 'success' : 'empty',
          data: currentDayPlan ?? null
        };
      }),

      startWith<MealPlanState>(this.INITIAL_STATE),

      catchError(() => of<MealPlanState>({
        status: 'error',
        error: ''
      }))
    ),
    {initialValue: this.INITIAL_STATE}
  );
  readonly isLoading = computed(() => this.state().status === 'loading');
  readonly isError = computed(() => this.state().status === 'error');
  readonly dailyPlan = computed(() => this.state().data);
  readonly errorMessage = computed(() => this.state().error);

  retry() {
    window.location.reload();
  }
}
