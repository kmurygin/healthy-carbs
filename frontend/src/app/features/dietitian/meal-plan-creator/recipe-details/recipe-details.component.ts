import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import type {RecipeDto} from '@core/models/dto/recipe.dto';

@Component({
  selector: 'app-recipe-details',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recipe-details-title"
      aria-describedby="recipe-details-content"
      tabindex="0"
      (keydown)="onDialogKeydown($event)"
    >
      <button
        type="button"
        class="absolute inset-0 bg-black/50"
        aria-label="Close recipe details"
        (click)="closeOutputEmitter.emit()"
      ></button>

      <div
        class="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden
        rounded-2xl bg-white shadow-2xl flex flex-col animate-fade-in"
      >
        <div class="p-5 border-b border-gray-100 flex justify-between items-start bg-gray-50">
          <div class="min-w-0">
            <h2 id="recipe-details-title" class="text-xl font-bold text-gray-800 truncate">
              {{ recipe().name }}
            </h2>

            <div class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-600">
              <span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs font-bold">
                {{ recipe().calories | number: '1.0-0' }} kcal
              </span>
              <span>Protein: {{ recipe().protein | number: '1.0-0' }}g</span>
              <span>Fat: {{ recipe().fat | number: '1.0-0' }}g</span>
              <span>Carbs: {{ recipe().carbs | number: '1.0-0' }}g</span>
            </div>
          </div>

          <button
            type="button"
            (click)="closeOutputEmitter.emit()"
            class="ml-3 shrink-0 rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 hover:cursor-pointer
            focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            aria-label="Close"
          >
            <i class="fa-solid fa-xmark text-lg" aria-hidden="true"></i>
          </button>
        </div>

        <div id="recipe-details-content" class="p-6 overflow-y-auto">
          @if (recipe().description) {
            <p class="text-gray-600 mb-6 italic">
              {{ recipe().description }}
            </p>
          }

          <div class="mb-6">
            <h3 class="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <i class="fa-solid fa-basket-shopping text-emerald-600" aria-hidden="true"></i>
              Ingredients
            </h3>

            <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              @for (ingredientLine of recipe().ingredients; track ingredientLine.id) {
                <li class="text-sm text-gray-700 flex justify-between gap-3 border-b border-gray-50 py-1">
                  <span class="min-w-0 truncate">
                    {{ ingredientLine.ingredient.name }}
                  </span>
                  <span class="shrink-0 font-medium text-gray-900">
                    {{ ingredientLine.quantity }} {{ ingredientLine.ingredient.unit || '' }}
                  </span>
                </li>
              }
            </ul>
          </div>

          <div>
            <h3 class="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <i class="fa-solid fa-list-ol text-emerald-600" aria-hidden="true"></i>
              Instructions
            </h3>

            <div class="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {{ recipe().instructions }}
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            type="button"
            (click)="closeOutputEmitter.emit()"
            class="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800
            hover:bg-gray-300 transition-colors focus:outline-none focus-visible:ring-2
            focus-visible:ring-emerald-500 focus-visible:ring-offset-2 hover:cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .animate-fade-in {
        animation: fadeIn 0.18s ease-out;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: scale(0.97);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
    `,
  ],
})
export class RecipeDetailsComponent {
  readonly recipe = input.required<RecipeDto>();
  readonly closeOutputEmitter = output();

  onDialogKeydown(keyboardEvent: KeyboardEvent): void {
    if (keyboardEvent.key === 'Escape') {
      keyboardEvent.preventDefault();
      this.closeOutputEmitter.emit();
    }
  }
}
