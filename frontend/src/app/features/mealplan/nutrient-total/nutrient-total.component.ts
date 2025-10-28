import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {DecimalPipe} from "@angular/common";

@Component({
  selector: 'app-nutrient-total',
  imports: [
    DecimalPipe
  ],
  templateUrl: './nutrient-total.component.html',
  styleUrl: './nutrient-total.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NutrientTotalComponent {
  readonly total = input.required<number>();
  readonly target = input.required<number>();
  readonly percent = input.required<number>();
  readonly progressBarPercent = input.required<number>();
  readonly unit = input.required<string>();
  readonly label = input.required<string>();
  readonly iconClasses = input.required<string>();
  readonly barColorClass = input.required<string>();
}
