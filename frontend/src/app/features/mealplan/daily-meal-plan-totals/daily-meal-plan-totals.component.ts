import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';

import {NutrientTotalComponent} from "../nutrient-total/nutrient-total.component";

type Totals = Readonly<{
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}>;

@Component({
  selector: 'app-daily-meal-plan-totals',
  imports: [NutrientTotalComponent],
  templateUrl: './daily-meal-plan-totals.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DailyMealPlanTotalsComponent {
  readonly dailyTotals = input<Totals>({calories: 0, carbs: 0, protein: 0, fat: 0});
  readonly dailyTargets = input<Totals>({calories: 0, carbs: 0, protein: 0, fat: 0});

  readonly displayHeader = input<boolean>(true);

  readonly percents = computed<Totals>(() => {
    const totals = this.dailyTotals();
    const dailyTargets = this.dailyTargets();
    return {
      calories: this.getPercentageOfTotal(totals.calories, dailyTargets.calories),
      carbs: this.getPercentageOfTotal(totals.carbs, dailyTargets.carbs),
      protein: this.getPercentageOfTotal(totals.protein, dailyTargets.protein),
      fat: this.getPercentageOfTotal(totals.fat, dailyTargets.fat),
    };
  });

  readonly progressBarPercents = computed<Totals>(() => {
    const p = this.percents();
    return {
      calories: this.restrictToRange(p.calories),
      carbs: this.restrictToRange(p.carbs),
      protein: this.restrictToRange(p.protein),
      fat: this.restrictToRange(p.fat),
    };
  });

  private getPercentageOfTotal(value: number, target: number) {
    if (target <= 0) return 0;
    return (value / target) * 100;
  }

  private restrictToRange(value: number, min = 0, max = 100): number {
    return Math.max(min, Math.min(max, value || 0));
  }

}
