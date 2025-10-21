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
  total = input.required<number>();
  target = input.required<number>();
  percent = input.required<number>();
  progressBarPercent = input.required<number>();
  unit = input.required<string>();
  label = input.required<string>();
  iconClasses = input.required<string>();
  barColorClass = input.required<string>();
}
