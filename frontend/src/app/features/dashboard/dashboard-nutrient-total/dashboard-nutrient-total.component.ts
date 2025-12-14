import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {DecimalPipe} from '@angular/common';

@Component({
  selector: 'app-dashboard-nutrient-total',
  imports: [DecimalPipe],
  template: `
    <div class="flex flex-col gap-0.5">
      <div
        class="flex items-center gap-2 text-xs font-bold
        text-gray-400 uppercase tracking-wider mb-1"
      >
        <i [class]="iconClasses()"></i>
        <span>{{ label() }}</span>
      </div>

      <div class="flex items-baseline flex-wrap gap-1">
        <span class="text-xl font-extrabold text-gray-900 tracking-tight">
          {{ total() | number: '1.0-0' }}
        </span>

        <div class="flex items-baseline text-gray-400 font-medium text-sm">
          <span class="mr-1">/</span>
          <span>{{ target() | number: '1.0-0' }}</span>
          <span class="text-xs ml-0.5">{{ unit() }}</span>
        </div>

        <span
          class="ml-1 text-xs font-bold"
          [class]="percent() > 100 ? 'text-red-500' : 'text-emerald-500'"
        >
          ({{ percent() | number:'1.0-0' }}%)
        </span>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardNutrientTotalComponent {
  readonly total = input.required<number>();
  readonly target = input.required<number>();
  readonly percent = input.required<number>();
  readonly unit = input.required<string>();
  readonly label = input.required<string>();
  readonly iconClasses = input.required<string>();
}
