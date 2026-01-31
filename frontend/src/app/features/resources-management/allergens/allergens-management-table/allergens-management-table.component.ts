import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faTrash} from '@fortawesome/free-solid-svg-icons';
import type {AllergenDto} from '@core/models/dto/allergen.dto';

@Component({
  selector: 'app-allergens-management-table',
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <div class="hidden md:block overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white">
      <table class="min-w-full text-sm text-left">
        <thead class="bg-gray-50 text-gray-600 border-b border-gray-200">
        <tr>
          <th class="px-6 py-4 font-medium">Name</th>
          <th class="px-6 py-4 font-medium text-right">Actions</th>
        </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          @for (allergen of allergens(); track allergen.id) {
            <tr class="hover:bg-gray-50/80 transition-colors">
              <td class="px-6 py-4">
                <span class="font-medium text-gray-900">{{ allergen.name }}</span>
              </td>
              <td class="px-6 py-4 text-right">
                <button
                  (click)="delete.emit(allergen)"
                  class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50
            rounded-lg transition-colors cursor-pointer" title="Delete allergen"
                >
                  <fa-icon [icon]="icons.trash" class="text-sm"></fa-icon>
                </button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllergensManagementTableComponent {
  readonly allergens = input.required<readonly AllergenDto[]>();
  readonly delete = output<AllergenDto>();

  protected readonly icons = {
    trash: faTrash
  };
}
