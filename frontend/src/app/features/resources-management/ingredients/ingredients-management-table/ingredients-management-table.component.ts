import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {CommonModule, DecimalPipe} from '@angular/common';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faFire, faGlobe, faPen, faTrash, faUserTag} from '@fortawesome/free-solid-svg-icons';
import type {IngredientDto} from '@core/models/dto/ingredient.dto';
import {IngredientCategory} from "@core/models/enum/ingredient-category.enum";
import {CategoryIconMap} from "@core/constants/category-icon.map";
import {formatEnum} from "@shared/utils";

@Component({
  selector: 'app-ingredients-management-table',
  imports: [CommonModule, FontAwesomeModule, DecimalPipe],
  template: `
    <div class="overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white">
      <table class="min-w-full text-sm text-center">
        <thead class="bg-gray-50 text-gray-600 border-b border-gray-200">
        <tr>
          <th class="px-6 py-4 font-medium">Name</th>
          <th class="px-6 py-4 font-medium">Category</th>
          <th class="px-6 py-4 font-medium">Author</th>
          <th class="px-6 py-4 font-medium">Unit</th>
          <th class="px-6 py-4 font-medium text-center">Calories</th>
          <th class="px-6 py-4 font-medium text-center">Macros (per unit)</th>
          <th class="px-6 py-4 font-medium text-right">Actions</th>
        </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          @for (ingredient of ingredients(); track ingredient.id) {
            <tr class="hover:bg-gray-50/80 transition-colors">
              <td class="px-6 py-4 font-semibold text-gray-900">{{ ingredient.name }}</td>

              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full
                  text-xs font-medium bg-emerald-50 text-emerald-900"
                >
                <i
                  [class]="iconFor(ingredient.category)"
                  aria-hidden="true"
                  class="fa-solid w-5 text-center mr-1"
                >
                </i>
                  {{ formatEnum(ingredient.category) }}
                </span>
              </td>

              <td class="px-6 py-4 text-gray-500">
                @if (ingredient.author) {
                  <span
                    class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1
                    text-xs font-medium text-emerald-700"
                  >
                    <fa-icon [icon]="icons.userTag"></fa-icon>
                    {{ ingredient.author.username }}
                  </span>
                } @else {
                  <span
                    class="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1
                    text-xs font-medium text-gray-600"
                  >
                    <fa-icon [icon]="icons.globe"></fa-icon>
                    System
                  </span>
                }
              </td>

              <td class="px-6 py-4 text-gray-500">{{ ingredient.unit }}</td>

              <td class="px-6 py-4 text-center">
                 <span class="inline-flex items-center gap-1 font-semibold text-gray-900">
                  <fa-icon [icon]="icons.fire" class="text-orange-500 text-xs"></fa-icon>
                   {{ ingredient.caloriesPerUnit | number:'1.0-0' }}
                </span>
              </td>

              <td class="px-6 py-4">
                <div class="flex items-center justify-center gap-3 text-xs text-gray-600">
                  <span class="flex flex-col items-center" title="Carbs">
                    <span class="font-medium text-amber-700">
                      {{ ingredient.carbsPerUnit | number:'1.0-1' }}
                    </span>
                    <span class="text-[10px] text-gray-400">carbs</span>
                  </span>
                  <div class="h-4 w-px bg-gray-200"></div>
                  <span class="flex flex-col items-center" title="Protein">
                    <span class="font-medium text-red-700">
                      {{ ingredient.proteinPerUnit | number:'1.0-1' }}
                    </span>
                    <span class="text-[10px] text-gray-400">protein</span>
                  </span>
                  <div class="h-4 w-px bg-gray-200"></div>
                  <span class="flex flex-col items-center" title="Fat">
                    <span class="font-medium text-yellow-700">
                      {{ ingredient.fatPerUnit | number:'1.0-1' }}
                    </span>
                    <span class="text-[10px] text-gray-400">fat</span>
                  </span>
                </div>
              </td>

              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    (click)="canModify(ingredient) && edit.emit(ingredient.id)"
                    [class.opacity-30]="!canModify(ingredient)"
                    [disabled]="!canModify(ingredient)"
                    class="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50
                    rounded-lg transition-colors disabled:cursor-not-allowed cursor-pointer"
                    title="Edit ingredient"
                  >
                    <fa-icon [icon]="icons.pen" class="text-sm"></fa-icon>
                  </button>
                  <button
                    (click)="canModify(ingredient) && delete.emit(ingredient.id)"
                    [class.opacity-30]="!canModify(ingredient)"
                    [disabled]="!canModify(ingredient)"
                    class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50
                    rounded-lg transition-colors disabled:cursor-not-allowed cursor-pointer"
                    title="Delete ingredient"
                  >
                    <fa-icon [icon]="icons.trash" class="text-sm"></fa-icon>
                  </button>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IngredientsManagementTableComponent {
  readonly ingredients = input.required<readonly IngredientDto[]>();
  readonly currentUserId = input<number | null>(null);
  readonly isAdmin = input<boolean>(false);
  readonly edit = output<number>();
  readonly delete = output<number>();
  protected readonly icons = {
    pen: faPen,
    trash: faTrash,
    fire: faFire,
    userTag: faUserTag,
    globe: faGlobe,
  };
  protected readonly formatEnum = formatEnum;

  isIngredientCategory(value: string): value is IngredientCategory {
    return value in IngredientCategory;
  }

  iconFor(category: IngredientCategory): string {
    const key = category.toUpperCase().trim();
    if (this.isIngredientCategory(key)) {
      return CategoryIconMap[key];
    }
    return CategoryIconMap[IngredientCategory.OTHER];
  }

  canModify(ingredient: IngredientDto): boolean {
    return this.isAdmin() || ingredient.author?.id === this.currentUserId();
  }
}
