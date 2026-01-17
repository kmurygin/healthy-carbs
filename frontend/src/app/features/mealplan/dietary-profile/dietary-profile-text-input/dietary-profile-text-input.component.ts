import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {AbstractInputComponent} from "@shared/components/abstract-input/abstract-input.component";

@Component({
  selector: 'app-dietary-profile-text-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <label [for]="id()" class="text-sm font-medium text-gray-700">
        {{ label() }}
      </label>

      <input
        [id]="id()"
        [type]="type()"
        [value]="value()"
        [disabled]="isDisabled()"
        (input)="onInputChange($event)"
        (blur)="onBlur()"
        [attr.inputmode]="inputMode()"
        [attr.min]="min()"
        [attr.max]="max()"
        [attr.step]="step()"
        [attr.aria-invalid]="hasError"
        [attr.aria-describedby]="hasError ? id() + '-error' : null"
        class="form-input mt-1 block w-full rounded-xl border text-gray-900 h-10 px-3 shadow-sm
        focus:outline-none focus:ring-2 focus:border-emerald-500 focus:ring-emerald-500
        transition-colors duration-200 bg-white"
        [class.border-gray-300]="!hasError"
        [class.border-red-500]="hasError"
        [class.focus:border-red-500]="hasError"
        [class.focus:ring-red-500]="hasError"
      />

      @if (hasError) {
        <p class="mt-1 text-sm text-red-600" [id]="id() + '-error'" role="alert">
          {{ errorMessage }}
        </p>
      }
    </div>
  `,
})
export class DietaryProfileTextInputComponent extends AbstractInputComponent<string | number> {
  readonly type = input<string>('text');
  readonly inputMode = input<string>('text');
  readonly min = input<string | number | null>(null);
  readonly max = input<string | number | null>(null);
  readonly step = input<string | number | null>(null);

  override get errorMessage(): string {
    const control = this.control;
    if (!control?.errors) return '';

    if (control.hasError('required')) {
      return `${this.label()} is required.`;
    }

    if (control.hasError('min') || control.hasError('max')) {
      return `Please enter a valid ${this.label().toLowerCase()}.`;
    }

    return 'Invalid value';
  }

  onInputChange(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;
    this.value.set(inputValue);
    this.onChangeCallback(inputValue);
  }
}
