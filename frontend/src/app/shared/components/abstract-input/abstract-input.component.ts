import {Directive, inject, input, type OnDestroy, type OnInit, signal,} from '@angular/core';
import {type AbstractControl, type ControlValueAccessor, NgControl, type ValidationErrors,} from '@angular/forms';
import type {Subscription} from 'rxjs';

@Directive()
export abstract class AbstractInputComponent<T> implements ControlValueAccessor, OnInit, OnDestroy {
  readonly label = input.required<string>();
  readonly id = input.required<string>();

  readonly value = signal<T | null>(null);
  readonly isDisabled = signal(false);
  readonly validationErrors = signal<ValidationErrors | null>(null);
  readonly isTouchedOrDirty = signal(false);

  protected readonly ngControl: NgControl | null = inject(NgControl, {optional: true, self: true});
  private statusSubscription?: Subscription;

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  get control(): AbstractControl | null {
    return this.ngControl?.control ?? null;
  }

  get hasError(): boolean {
    return !!this.validationErrors() && this.isTouchedOrDirty();
  }

  abstract get errorMessage(): string;

  ngOnInit(): void {
    const control = this.control;
    if (control) {
      this.syncErrors();

      this.statusSubscription = control.statusChanges.subscribe(() => {
        this.syncErrors();
      });
    }
  }

  ngOnDestroy(): void {
    this.statusSubscription?.unsubscribe();
  }

  writeValue(value: unknown): void {
    this.value.set((value ?? null) as T | null);
  }

  registerOnChange(changeCallback: (value: T | null) => void): void {
    this.onChangeCallback = changeCallback;
  }

  registerOnTouched(touchedCallback: () => void): void {
    this.onTouchedCallback = touchedCallback;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  onBlur(): void {
    this.onTouchedCallback();
    this.isTouchedOrDirty.set(true);
    this.syncErrors();
  }

  /* eslint-disable @typescript-eslint/no-empty-function */
  protected onChangeCallback: (updatedValue: T | null) => void = () => {
  };

  protected onTouchedCallback: () => void = () => {
  };

  private syncErrors(): void {
    const control = this.control;
    if (control) {
      this.validationErrors.set(control.errors);
      if (control.touched || control.dirty) {
        this.isTouchedOrDirty.set(true);
      }
    }
  }
}
