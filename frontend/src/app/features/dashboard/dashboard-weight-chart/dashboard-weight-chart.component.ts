import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {NgApexchartsModule} from 'ng-apexcharts';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faChevronRight} from '@fortawesome/free-solid-svg-icons';
import {WEIGHT_CHART_CONFIG} from '@core/config/chart.config';
import type {UserMeasurement} from "@core/services/user-measurement/user-measurement.service";

@Component({
  selector: 'app-dashboard-weight-chart',
  imports: [CommonModule, NgApexchartsModule, RouterLink, FaIconComponent],
  template: `
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-lg font-bold text-gray-900">Weight Trend</h2>
        <a
          routerLink="/user-measurements"
          class="text-sm text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-1"
        >
          Add Log
          <fa-icon [icon]="faChevronRight" class="text-xs"></fa-icon>
        </a>
      </div>

      <div id="chart" class="-ml-2 min-h-[280px] flex items-center justify-center">
        @if (chartData(); as options) {
          <apx-chart
            class="w-full"
            [chart]="options.chart!"
            [series]="options.series!"
            [xaxis]="options.xaxis!"
            [yaxis]="options.yaxis!"
            [stroke]="options.stroke!"
            [fill]="options.fill!"
            [grid]="options.grid!"
            [tooltip]="options.tooltip!"
            [dataLabels]="options.dataLabels!"

            [colors]="options.colors!"
            [markers]="options.markers!"
          ></apx-chart>
        }

        @if (!hasData()) {
          <div class="text-gray-400 text-sm flex flex-col items-center gap-2">
            @if (isLoading()) {
              <i class="fa-solid fa-spinner fa-spin text-xl text-emerald-500"></i>
              <span>Loading chart...</span>
            } @else {
              <span>No weight data available yet.</span>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep .apexcharts-menu-icon.apexcharts-selected svg {
      fill: #10b981 !important;
    }
    :host ::ng-deep .apexcharts-menu-icon:hover svg {
      fill: #10b981 !important;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardWeightChartComponent {
  readonly weightHistory = input.required<UserMeasurement[]>();

  readonly hasData = computed(() => this.weightHistory().length > 0);
  readonly isLoading = computed(() => this.weightHistory().length === 0);
  readonly chartData = computed(() => {
    if (!this.hasData()) return null;

    const seriesData = this.weightHistory().map(
      item => [new Date(item.date).getTime(), item.weight]
    );

    return {
      ...WEIGHT_CHART_CONFIG,
      series: [{name: "Weight", data: seriesData}]
    };
  });
  protected readonly faChevronRight = faChevronRight;
}
