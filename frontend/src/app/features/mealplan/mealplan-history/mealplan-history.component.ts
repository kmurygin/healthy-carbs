import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MealPlanService} from '@core/services/mealplan/mealplan.service';
import {toSignal} from '@angular/core/rxjs-interop';
import {catchError, map, of, startWith} from 'rxjs';
import {ErrorMessageComponent} from '@shared/components/error-message/error-message.component';
import {LoadingMessageComponent} from '@shared/components/loading-message/loading-message.component';
import type {HistoryState} from '../mealplan.util';
import {MealPlanTableComponent} from "@features/mealplan/mealplan-table/mealplan-table.component";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-mealplan-history',
  imports: [
    CommonModule,
    ErrorMessageComponent,
    LoadingMessageComponent,
    MealPlanTableComponent,
    MealPlanTableComponent,
    RouterLink,
  ],
  templateUrl: './mealplan-history.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealPlanHistoryComponent {
  private readonly mealPlanService = inject(MealPlanService);

  private readonly initialState: HistoryState = {
    plans: [],
    loading: true,
    error: null,
  };

  private readonly historyState = toSignal(
    this.mealPlanService.getHistory().pipe(
      map((plans) => ({plans, loading: false, error: null})),
      startWith(this.initialState),
      catchError(() =>
        of({
          plans: [],
          loading: false,
          error: 'Failed to load meal plan history.',
        }),
      ),
    ),
    {initialValue: this.initialState},
  );

  readonly loading = computed(() => this.historyState().loading);
  readonly mealPlans = computed(() => this.historyState().plans);
  readonly errorMessage = computed(() => this.historyState().error);

}
