import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {RouterLink} from '@angular/router';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faChevronRight} from '@fortawesome/free-solid-svg-icons';
import {DASHBOARD_CATEGORIES} from '@core/config/dashboard.config';

@Component({
  selector: 'app-dashboard-nav-grid',
  imports: [CommonModule, RouterLink, NgOptimizedImage, FaIconComponent],
  template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      @for (category of categories; track category.name) {
        <a
          [routerLink]="[category.route]"
          class="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100
          transition-all duration-300 hover:shadow-lg hover:border-emerald-100"
        >

          <div class="relative w-full aspect-2/1 bg-gray-100 overflow-hidden">
            <img
              [ngSrc]="category.image"
              [alt]="category.name"
              fill
              class="object-cover transition-transform duration-700 group-hover:scale-105"
            >
            <div class="absolute inset-0 group-hover:bg-black/5 transition-colors duration-300"></div>
          </div>

          <div class="p-4 flex items-center justify-between">
            <div>
              <h3
                class="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors"
              >
                {{ category.name }}
              </h3>
              <p class="text-xs text-gray-500 mt-0.5 font-medium">
                {{ category.subtitle }}
              </p>
            </div>

            <div
              class="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center
              justify-center hover:bg-emerald-600 hover:text-white transition-all duration-300"
            >
              <fa-icon [icon]="faChevronRight" class="text-xs"></fa-icon>
            </div>
          </div>

        </a>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardNavGridComponent {
  readonly categories = DASHBOARD_CATEGORIES;
  protected readonly faChevronRight = faChevronRight;
}
