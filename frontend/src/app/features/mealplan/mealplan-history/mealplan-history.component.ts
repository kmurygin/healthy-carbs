import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {RouterModule} from '@angular/router';
import {MealPlanService} from "../../../core/services/mealplan/mealplan.service";
import {toSignal} from '@angular/core/rxjs-interop';
import {catchError, map, of, startWith} from 'rxjs';
import {MealPlanHistoryItemComponent} from '../mealplan-history-item/meal-plan-history-item.component';
import {ErrorMessageComponent} from "../../../shared/components/error-message/error-message.component";
import type {HistoryState, MealPlanRow} from "../mealplan.util";
import {buildRows} from "../mealplan.util";

@Component({
  selector: 'app-mealplan-history',
  imports: [CommonModule, RouterModule, DatePipe, MealPlanHistoryItemComponent, ErrorMessageComponent],
  templateUrl: './mealplan-history.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealPlanHistoryComponent {
  readonly expandedMealPlans = signal<ReadonlySet<number>>(new Set());
  readonly rows = computed<readonly MealPlanRow[]>(
    () => buildRows(this.mealPlans())
  );
  private readonly mealPlanService = inject(MealPlanService);
  private readonly initialState: HistoryState = {
    plans: [],
    loading: true,
    error: null,
  };
  private readonly historyState = toSignal(
    this.mealPlanService.getHistory().pipe(
      map(plans => ({plans, loading: false, error: null})),
      startWith(this.initialState),
      catchError(() => of(
        {plans: [], loading: false, error: 'Failed to load meal plan history.'}
      ))
    ),
    {initialValue: this.initialState}
  );
  readonly loading = computed(() => this.historyState().loading);
  readonly mealPlans = computed(() => this.historyState().plans);
  readonly errorMessage = computed(() => this.historyState().error);

  toggleExpanded(id: number): void {
    this.expandedMealPlans.update(set =>
      set.has(id)
        ? new Set([...set].filter(x => x !== id))
        : new Set(set).add(id)
    );
  }

}
