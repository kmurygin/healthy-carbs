import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faBullseye, faWeightScale} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-dashboard-header',
  imports: [CommonModule, FaIconComponent],
  template: `
    <div class="bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div>
            <h1 class="text-xl font-bold text-gray-900">Dashboard</h1>
            <p class="text-xs text-gray-500">Welcome back to Healthy Carbs</p>
          </div>

          <div class="flex gap-6 overflow-x-auto pb-1 sm:pb-0">
            <div class="flex items-center gap-3 shrink-0">
              <div
                class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"
              >
                <fa-icon [icon]="faWeightScale"></fa-icon>
              </div>
              <div>
                <p class="text-xs text-gray-500 font-medium">Current Weight</p>
                <div class="flex items-baseline gap-2">
                  <span class="text-lg font-bold text-gray-900">{{ currentWeight() || '--' }}</span>
                  <span class="text-xs font-semibold text-gray-500">kg</span>
                  @if (weightDifference() !== null) {
                    <span
                      [class]=weightDifferenceClasses()
                      class="text-xs font-medium px-1.5 py-0.5 rounded"
                    >
                      {{ weightDifferenceLabel() }}
                    </span>
                  }
                </div>
              </div>
            </div>

            <div class="hidden sm:block w-px h-10 bg-gray-200"></div>

            <div class="flex items-center gap-3 shrink-0">
              <div
                class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"
              >
                <fa-icon [icon]="faBullseye"></fa-icon>
              </div>
              <div>
                <p class="text-xs text-gray-500 font-medium">Goal Status</p>
                <p class="text-sm font-bold text-gray-900">On Track</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardHeaderComponent {
  readonly currentWeight = input<number | null>(null);
  readonly weightDifference = input<number | null>(null);
  readonly weightDifferenceClasses = computed(() => {
    const difference = this.weightDifference();
    if (difference === null) return '';

    return difference <= 0
      ? 'text-emerald-600 bg-emerald-50'
      : 'text-red-500 bg-red-50';
  });
  readonly weightDifferenceLabel = computed(() => {
    const difference = this.weightDifference();
    if (difference === null) return '';

    return difference > 0 ? `+${difference}` : `-${difference}`;
  });
  protected readonly faWeightScale = faWeightScale;
  protected readonly faBullseye = faBullseye;
}
