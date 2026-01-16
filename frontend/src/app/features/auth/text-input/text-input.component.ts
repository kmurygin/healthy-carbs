import {ChangeDetectionStrategy, Component, inject, input, type OnDestroy, type OnInit, signal,} from '@angular/core';
import {type AbstractControl, type ControlValueAccessor, NgControl,} from '@angular/forms';
import type {Subscription} from 'rxjs';

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
export class TextInputComponent implements ControlValueAccessor, OnInit, OnDestroy {
  readonly label = input.required<string>();
  readonly id = input.required<string>();
  readonly placeholder = input<string>('');
  readonly type = input<string>('text');
  readonly autocomplete = input<string>('off');
  readonly autocapitalize = input<string>('none');

  readonly value = signal('');
  readonly isDisabled = signal(false);

  private readonly ngControl = inject(NgControl, {optional: true, self: true});

  private statusSubscription?: Subscription;
  private valueSub?: Subscription;

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  get formControl(): AbstractControl | null {
    return this.ngControl?.control ?? null;
  }

  get hasError(): boolean {
    const control = this.formControl;
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  get errorMessage(): string {
    const control = this.formControl;
    if (!control?.errors) return '';

    if (control.hasError('required')) return `${this.label()} is required`;
    if (control.hasError('email')) return 'Invalid email format';
    if (control.hasError('minlength')) {
      const minLengthError = control.errors['minlength'] as { requiredLength: number };
      return `Min ${minLengthError.requiredLength} characters`;
    }
    if (control.hasError('mismatch')) return 'Passwords do not match';

    return 'Invalid value';
  }

  ngOnInit(): void {
    const control = this.formControl;
    if (!control) return;
    this.statusSubscription = control.statusChanges.subscribe(() => {
      this.value.update((updatedValue: string) => updatedValue);
    });
  }

  ngOnDestroy(): void {
    this.statusSubscription?.unsubscribe();
    this.valueSub?.unsubscribe();
  }

  onInput(event: Event): void {
    const next: string = (event.target as HTMLInputElement).value;
    this.value.set(next);
    this.onChange(next);
  }

  onBlur(): void {
    this.onTouched();
  }

  writeValue(value: unknown): void {
    this.value.set((value ?? '') as string);
  }

  registerOnChange(onChangeCallback: (value: string) => void): void {
    this.onChange = onChangeCallback;
  }

  registerOnTouched(onTouchedCallback: () => void): void {
    this.onTouched = onTouchedCallback;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  /* eslint-disable @typescript-eslint/no-empty-function */
  private onChange: (value: string) => void = () => {
  };
  private onTouched: () => void = () => {
  };
}
