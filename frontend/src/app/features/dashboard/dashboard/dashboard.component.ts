import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {toSignal} from '@angular/core/rxjs-interop';
import {UserMeasurementService} from '@core/services/user-measurement/user-measurement.service';
import {MealPlanInfoComponent} from '@features/dashboard/meal-plan-info/meal-plan-info.component';
import {DashboardHeaderComponent} from '../dashboard-header/dashboard-header.component';
import {DashboardWeightChartComponent} from '../dashboard-weight-chart/dashboard-weight-chart.component';
import {DashboardNavGridComponent} from '../dashboard-nav-grid/dashboard-nav-grid.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    DashboardHeaderComponent,
    DashboardWeightChartComponent,
    DashboardNavGridComponent,
    MealPlanInfoComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-50 pb-12">
      <app-dashboard-header
        [currentWeight]="currentWeight()"
        [weightDifference]="weightDifference()">
      </app-dashboard-header>

      <div class="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 flex flex-col gap-6">
            <app-dashboard-weight-chart
              [weightHistory]="weightHistory()">
            </app-dashboard-weight-chart>
            <app-dashboard-nav-grid></app-dashboard-nav-grid>
          </div>

          <div class="lg:col-span-1 h-full min-h-[500px]">
            <div class="sticky top-24 h-full">
              <app-meal-plan-info class="block h-full"></app-meal-plan-info>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  private readonly measurementService = inject(UserMeasurementService);
  readonly weightHistory = toSignal(this.measurementService.getAllHistory());
  readonly currentWeight = computed(() => {
    const data = this.weightHistory();
    return data?.length ? data[data.length - 1].weight : null;
  });
  readonly weightDifference = computed(() => {
    const data = this.weightHistory();
    if (!data || data.length < 2) return null;

    const latest = data[data.length - 1];
    const prev = data[data.length - 2];
    return Number((latest.weight - prev.weight).toFixed(1));
  });
}
