import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import {SourceTagComponent} from '@features/mealplan/source-tag/source-tag.component';
import {buildRows, type MealPlanRow} from '@features/mealplan/mealplan.util';
import {type MealPlanDto} from '@core/models/dto/mealplan.dto';

@Component({
  selector: 'app-mealplan-table',
  imports: [CommonModule, RouterLink, DatePipe, SourceTagComponent],
  template: `
    <div class="md:hidden space-y-4">
      @for (planRow of rows(); track planRow.id) {
        <div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:bg-gray-50">
          <a
            [routerLink]="['/mealplan', planRow.id]"
            role="link"
          >
            <div class="flex items-center justify-between">
              <div class="font-semibold text-gray-900">
                {{ planRow.createdAt | date: 'medium' }}
              </div>
              <app-source-tag [source]="planRow.source"/>
            </div>

            <div class="text-sm text-gray-500 mt-0.5">
              {{ planRow.daysCount }} days
            </div>

            <div class="mt-2 flex flex-row flex-wrap gap-x-3 gap-y-1 text-sm text-gray-600">
            <span class="inline-flex items-center gap-1.5 font-medium">
              <i aria-hidden="true" class="fa-solid fa-fire w-3 text-center text-orange-500"></i>
              {{ planRow.total.calories }} kcal
            </span>
              <span class="inline-flex items-center gap-1.5 font-medium">
              <i aria-hidden="true" class="fa-solid fa-bread-slice w-3 text-center text-amber-600"></i>
                {{ planRow.total.carbs }} g
            </span>
              <span class="inline-flex items-center gap-1.5 font-medium">
              <i aria-hidden="true" class="fa-solid fa-drumstick-bite w-3 text-center text-red-500"></i>
                {{ planRow.total.protein }} g
            </span>
              <span class="inline-flex items-center gap-1.5 font-medium">
              <i aria-hidden="true" class="fa-solid fa-bottle-droplet w-3 text-center text-yellow-600"></i>
                {{ planRow.total.fat }} g
            </span>
            </div>

            <div class="mt-3 flex items-center justify-end text-emerald-600 text-sm font-medium">
              <i class="fa-solid fa-arrow-right ml-1.5"></i>
            </div>
          </a>
        </div>
      }
    </div>

    <div class="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm hidden md:block">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50 text-center text-gray-600">
        <tr>
          <th class="px-4 py-3 font-medium">#</th>
          <th class="px-4 py-3 font-medium">Created At</th>
          <th class="px-4 py-3 font-medium">Source</th>
          <th class="px-4 py-3 font-medium">Days</th>
          <th class="px-4 py-3 font-medium">Average calories (kcal)</th>
          <th class="px-4 py-3 font-medium">Average carbs (g)</th>
          <th class="px-4 py-3 font-medium">Average protein (g)</th>
          <th class="px-4 py-3 font-medium">Average fat (g)</th>
          <th class="px-4 py-3 font-medium"></th>
        </tr>
        </thead>
        <tbody>
          @for (planRow of rows(); track planRow.id) {
            <tr class="border-t border-gray-200 text-center bg-white">
              <td class="px-4 py-3 font-medium text-gray-500">
                {{ planRow.idx + 1 }}
              </td>
              <td class="px-4 py-3">{{ planRow.createdAt | date: 'medium' }}</td>
              <td class="px-4 py-3">
                <app-source-tag [source]="planRow.source"/>
              </td>
              <td class="px-4 py-3">{{ planRow.daysCount }}</td>
              <td class="px-4 py-3">{{ planRow.total.calories }}</td>
              <td class="px-4 py-3">{{ planRow.total.carbs }}</td>
              <td class="px-4 py-3">{{ planRow.total.protein }}</td>
              <td class="px-4 py-3">{{ planRow.total.fat }}</td>
              <td class="px-4 py-3 text-center">
                <a
                  [routerLink]="['/mealplan', planRow.id]"
                  class="inline-flex items-center justify-centre gap-2 rounded-lg
                  px-1.5 py-1.5 font-medium transition text-emerald-600 text-xl"
                >
                  <i class="fa-solid fa-circle-arrow-right"></i>
                </a>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealPlanTableComponent {
  readonly mealPlans = input.required<MealPlanDto[]>();

  readonly rows = computed<readonly MealPlanRow[]>(() =>
    buildRows(this.mealPlans())
  );
}
