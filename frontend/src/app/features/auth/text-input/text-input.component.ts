import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {AbstractInputComponent} from "@shared/components/abstract-input/abstract-input.component";

@Component({
  selector: 'app-text-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full">
      <label [for]="id()" class="block mb-1 text-sm font-medium text-gray-700">
        {{ label() }}
      </label>

      <input
        [id]="id()"
        [type]="type()"
        [placeholder]="placeholder()"
        [autocomplete]="autocomplete()"
        [disabled]="isDisabled()"
        [value]="value()"
        (input)="onInput($event)"
        (blur)="onBlur()"
        class="w-full px-3 py-2 border rounded-md shadow-sm bg-white
        focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent
        disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
        transition-all duration-200 ease-in-out"
        [class]="{
          'border-gray-300': !hasError,
          'border-red-500 focus:ring-red-500': hasError
        }"
        [attr.aria-invalid]="hasError"
        [autocapitalize]="autocapitalize()"
      />

      @if (hasError) {
        <p class="mt-1 text-xs text-red-600 animate-pulse">
          {{ errorMessage }}
        </p>
      }
    </div>
  `,
})
export class TextInputComponent extends AbstractInputComponent<string | number> {
  readonly placeholder = input<string>('');
  readonly type = input<string>('text');
  readonly autocomplete = input<string>('off');
  readonly autocapitalize = input<string>('none');

  override get errorMessage(): string {
    const errors = this.validationErrors();
    if (!errors) return '';

    if (errors['required']) return `${this.label()} is required`;
    if (errors['email']) return 'Invalid email format';

    if (errors['minlength']) {
      const minLengthError = errors['minlength'] as { requiredLength: number };
      return `Min ${minLengthError.requiredLength} characters`;
    }

    if (errors['mismatch']) return 'Passwords do not match';

    return 'Invalid value';
  }

  onInput(event: Event): void {
    const enteredText = (event.target as HTMLInputElement).value;
    this.value.set(enteredText);
    this.onChangeCallback(enteredText);
  }
}
