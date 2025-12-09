import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {RouterModule} from '@angular/router';
import {MealPlanService} from '@core/services/mealplan/mealplan.service';
import {toSignal} from '@angular/core/rxjs-interop';
import {catchError, map, of, startWith} from 'rxjs';
import {ErrorMessageComponent} from '@shared/components/error-message/error-message.component';
import type {HistoryState, MealPlanRow} from '../mealplan.util';
import {buildRows} from '../mealplan.util';
import {SourceTagComponent} from "@features/mealplan/source-tag/source-tag.component";

@Component({
  selector: 'app-mealplan-history',
  imports: [
    CommonModule,
    RouterModule,
    DatePipe,
    ErrorMessageComponent,
    SourceTagComponent,
    ErrorMessageComponent,
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
  readonly rows = computed<readonly MealPlanRow[]>(
    () => buildRows(this.mealPlans())
  );
  readonly errorMessage = computed(() => this.historyState().error);
}
