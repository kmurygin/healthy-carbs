import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {AbstractInputComponent} from "@shared/components/abstract-input/abstract-input.component";
import type {FormOption} from "@shared/form-option";

@Component({
  selector: 'app-dietary-profile-select-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <label [for]="id()" class="text-sm font-medium text-gray-700">
        {{ label() }}
      </label>

      <div class="relative mt-1">
        <select
          [id]="id()"
          [value]="value() ?? ''"
          [disabled]="isDisabled()"
          (change)="onSelectChange($event)"
          (blur)="onBlur()"
          [attr.aria-invalid]="hasError"
          [attr.aria-describedby]="hasError ? id() + '-error' : null"
          class="form-select block w-full appearance-none rounded-xl border border-gray-300 bg-white
          text-gray-900 h-10 px-3 shadow-sm focus:border-emerald-500 focus:ring-emerald-500
          focus:outline-none focus:ring-2 transition-colors duration-200 disabled:bg-gray-50
          disabled:text-gray-500"
          [class.border-red-500]="hasError"
          [class.focus:border-red-500]="hasError"
          [class.focus:ring-red-500]="hasError"
        >
          <option disabled value="">Select {{ label().toLowerCase() }}</option>
          @for (option of options(); track option.value) {
            <option [value]="option.value">
              {{ option.label }} {{ option.description ? '(' + option.description + ')' : '' }}
            </option>
          }
        </select>

        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
          <i aria-hidden="true" class="fa-solid fa-chevron-down h-4 w-4"></i>
        </div>
      </div>

      @if (hasError) {
        <p class="mt-1 text-sm text-red-600" [id]="id() + '-error'" role="alert">
          {{ errorMessage }}
        </p>
      }
    </div>
  `,
})
export class DietaryProfileSelectInputComponent extends AbstractInputComponent<string | number> {
  readonly options = input.required<FormOption<string>[]>();

  override get errorMessage(): string {
    if (this.control?.hasError('required')) {
      return `${this.label()} is required.`;
    }
    return 'Invalid selection.';
  }

  onSelectChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.value.set(selectedValue);
    this.onChangeCallback(selectedValue);
  }
}
