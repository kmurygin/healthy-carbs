import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {DashboardNutrientTotalComponent} from '../dashboard-nutrient-total/dashboard-nutrient-total.component';
import type {DailyNutrientTotals} from "@core/models/dashboard.model";

@Component({
  selector: 'app-dashboard-daily-totals',
  imports: [DashboardNutrientTotalComponent],
  template: `
    <div class="grid grid-cols-2 gap-x-6 gap-y-6">
      <app-dashboard-nutrient-total
        [percent]="percents().calories"
        [target]="dailyTargets().calories"
        [total]="dailyTotals().calories"
        iconClasses="fa-solid fa-fire text-orange-500"
        label="Calories"
        unit="kcal"
      />
      <app-dashboard-nutrient-total
        [percent]="percents().protein"
        [target]="dailyTargets().protein"
        [total]="dailyTotals().protein"
        iconClasses="fa-solid fa-drumstick-bite text-red-500"
        label="Protein"
        unit="g"
      />
      <app-dashboard-nutrient-total
        [percent]="percents().carbs"
        [target]="dailyTargets().carbs"
        [total]="dailyTotals().carbs"
        iconClasses="fa-solid fa-bread-slice text-amber-500"
        label="Carbs"
        unit="g"
      />
      <app-dashboard-nutrient-total
        [percent]="percents().fat"
        [target]="dailyTargets().fat"
        [total]="dailyTotals().fat"
        iconClasses="fa-solid fa-bottle-droplet text-yellow-500"
        label="Fat"
        unit="g"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardDailyTotalsComponent {
  readonly dailyTotals = input.required<DailyNutrientTotals>();
  readonly dailyTargets = input.required<DailyNutrientTotals>();

  readonly percents = computed<DailyNutrientTotals>(() => {
    const total = this.dailyTotals();
    const target = this.dailyTargets();

    return {
      calories: this.getPercentageOfTarget(total.calories, target.calories),
      carbs: this.getPercentageOfTarget(total.carbs, target.carbs),
      protein: this.getPercentageOfTarget(total.protein, target.protein),
      fat: this.getPercentageOfTarget(total.fat, target.fat),
    };
  });

  private getPercentageOfTarget(val: number, target: number): number {
    return target > 0 ? (val / target) * 100 : 0;
  }
}
