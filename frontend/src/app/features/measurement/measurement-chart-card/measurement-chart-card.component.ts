import {ChangeDetectionStrategy, Component, computed, input, type InputSignal, ViewEncapsulation} from '@angular/core';
import {CommonModule, DecimalPipe} from '@angular/common';
import {NgApexchartsModule} from 'ng-apexcharts';
import type {UserMeasurement} from "@core/services/user-measurement/user-measurement.service";
import {getMeasurementChartOptions} from "@core/config/chart.config";

export type ChartDataPoint = [number, number];

export interface MeasurementTypeDefinition {
  key: keyof UserMeasurement;
  label: string;
  unit: string;
}

function areChartDataPointsEqual(previousSeries: ChartDataPoint[], newSeries: ChartDataPoint[]): boolean {
  if (previousSeries === newSeries) return true;

  if (previousSeries.length !== newSeries.length) return false;

  const lastPreviousPoint: ChartDataPoint | undefined = previousSeries.at(-1);
  const lastNewPoint: ChartDataPoint | undefined = newSeries.at(-1);

  if (lastPreviousPoint?.[0] !== lastNewPoint?.[0] ||
    lastPreviousPoint?.[1] !== lastNewPoint?.[1]) {
    return false;
  }

  return JSON.stringify(previousSeries) === JSON.stringify(newSeries);
}

@Component({
  selector: 'app-measurement-chart-card',
  imports: [CommonModule, NgApexchartsModule, DecimalPipe],
  template: `
    <div
      class="bg-white rounded-xl shadow-sm border border-gray-100 p-6
      flex flex-col h-full transition-all hover:shadow-md"
    >

      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-lg font-bold text-gray-900">{{ measurementType().label }}</h3>
        @if (hasData()) {
          <span
            class="text-xs font-bold px-2 py-1 rounded bg-emerald-50
            text-emerald-700 border border-emerald-100"
          >
             Current: {{ currentMeasurementValue() | number:'1.1-1' }} {{ measurementType().unit }}
          </span>
        }
      </div>

      <div class="grow flex items-center justify-center min-h-[300px]">
        @if (chartOptions(); as options) {
          <div
            class="w-full"
            role="img"
            [attr.aria-label]="measurementType().label + ' history chart'"
          >
            <apx-chart
              [chart]="options.chart!"
              [grid]="options.grid!"
              [markers]="options.markers!"
              [series]="options.series!"
              [stroke]="options.stroke!"
              [fill]="options.fill!"
              [tooltip]="options.tooltip!"
              [xaxis]="options.xaxis!"
              [yaxis]="options.yaxis!"
              [colors]="options.colors!"
            ></apx-chart>
          </div>
        } @else {
          <div class="text-center text-gray-400 py-10 flex flex-col items-center">
            <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
              <i class="fa-solid fa-chart-line text-2xl text-gray-300"></i>
            </div>
            <p class="text-sm font-medium text-gray-500">No data available</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep .apexcharts-menu-icon.apexcharts-selected svg,
    :host ::ng-deep .apexcharts-menu-icon:hover svg {
      fill: #10b981 !important;
      stroke: #10b981 !important;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated
})
export class MeasurementChartCardComponent {
  readonly measurementType: InputSignal<MeasurementTypeDefinition> = input.required<MeasurementTypeDefinition>();
  readonly measurementHistory: InputSignal<UserMeasurement[]> = input.required<UserMeasurement[]>();

  readonly chartSeriesData = computed(() => {
    const key = this.measurementType().key;
    return this.measurementHistory()
      .filter(item => {
        const val = item[key];
        return typeof val === 'number' && val > 0;
      })
      .map((item): ChartDataPoint => [
        new Date(item.date).getTime(),
        item[key] as number
      ]);
  }, {equal: areChartDataPointsEqual});

  readonly hasData = computed(() => this.chartSeriesData().length > 0);

  readonly currentMeasurementValue = computed(() => {
    const data = this.chartSeriesData();
    return data.length > 0 ? data[data.length - 1][1] : 0;
  });

  readonly chartOptions = computed(() => {
    if (!this.hasData()) return null;
    const {label, unit} = this.measurementType();
    return getMeasurementChartOptions(label, unit, this.chartSeriesData());
  });
}
