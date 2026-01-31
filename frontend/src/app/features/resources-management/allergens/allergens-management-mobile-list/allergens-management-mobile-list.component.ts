import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faTrash} from '@fortawesome/free-solid-svg-icons';
import type {AllergenDto} from '@core/models/dto/allergen.dto';

@Component({
  selector: 'app-allergens-management-mobile-list',
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <div class="md:hidden space-y-4">
      @for (allergen of allergens(); track allergen.id) {
        <div
          class="rounded-2xl border border-gray-200 bg-white p-5
      shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="flex justify-between items-center">
            <h3 class="font-semibold text-gray-900">{{ allergen.name }}</h3>

            <button
              (click)="delete.emit(allergen)"
              class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium
            text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <fa-icon [icon]="icons.trash"></fa-icon>
              Delete
            </button>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllergensManagementMobileListComponent {
  readonly allergens = input.required<readonly AllergenDto[]>();
  readonly delete = output<AllergenDto>();

  protected readonly icons = {
    trash: faTrash
  };
}
