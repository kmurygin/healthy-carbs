import {ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal,} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NotificationService} from '@core/services/ui/notification.service';
import type {MeasurementPayload, UserMeasurement,} from '@core/services/user-measurement/user-measurement.service';
import {UserMeasurementService} from '@core/services/user-measurement/user-measurement.service';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faSave, faSpinner, faTimes} from '@fortawesome/free-solid-svg-icons';
import {A11yModule} from '@angular/cdk/a11y';

interface MeasurementForm {
  weight: FormControl<number | null>;
  waistCircumference: FormControl<number | null>;
  hipCircumference: FormControl<number | null>;
  chestCircumference: FormControl<number | null>;
  armCircumference: FormControl<number | null>;
  thighCircumference: FormControl<number | null>;
  calfCircumference: FormControl<number | null>;
}

interface CircumferenceFieldConfig {
  controlName: keyof MeasurementForm;
  label: string;
  id: string;
}

@Component({
  selector: 'app-measurement-form',
  imports: [ReactiveFormsModule, FontAwesomeModule, A11yModule],
  templateUrl: './measurement-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscapeKey()',
  },
})
export class MeasurementFormComponent {
  readonly initialMeasurement = input<UserMeasurement | null>(null);

  success = output();
  cancelled = output();

  readonly isSubmitting = signal(false);

  readonly formGroup = new FormGroup<MeasurementForm>({
    weight: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(20),
      Validators.max(300),
    ]),
    waistCircumference: new FormControl<number | null>(null, [Validators.min(10)]),
    hipCircumference: new FormControl<number | null>(null, [Validators.min(10)]),
    chestCircumference: new FormControl<number | null>(null, [Validators.min(10)]),
    armCircumference: new FormControl<number | null>(null, [Validators.min(5)]),
    thighCircumference: new FormControl<number | null>(null, [Validators.min(5)]),
    calfCircumference: new FormControl<number | null>(null, [Validators.min(5)]),
  });

  readonly isEditMode = computed(() => !!this.initialMeasurement());

  readonly circumferenceFields: CircumferenceFieldConfig[] = [
    {controlName: 'waistCircumference', label: 'Waist', id: 'waist'},
    {controlName: 'hipCircumference', label: 'Hips', id: 'hips'},
    {controlName: 'chestCircumference', label: 'Chest', id: 'chest'},
    {controlName: 'armCircumference', label: 'Arm (Biceps)', id: 'arm'},
    {controlName: 'thighCircumference', label: 'Thigh', id: 'thigh'},
    {controlName: 'calfCircumference', label: 'Calf', id: 'calf'},
  ];

  protected readonly icons = {
    save: faSave,
    spinner: faSpinner,
    times: faTimes,
  };

  private readonly measurementService = inject(UserMeasurementService);
  private readonly notificationService = inject(NotificationService);

  private readonly _prefillEffect = effect(() => {
    const measurement = this.initialMeasurement();

    if (!measurement) {
      this.formGroup.reset();
      return;
    }

    this.formGroup.patchValue({
      weight: measurement.weight,
      waistCircumference: measurement.waistCircumference ?? null,
      hipCircumference: measurement.hipCircumference ?? null,
      chestCircumference: measurement.chestCircumference ?? null,
      thighCircumference: measurement.thighCircumference ?? null,
      armCircumference: measurement.armCircumference ?? null,
      calfCircumference: measurement.calfCircumference ?? null,
    });

    this.formGroup.markAsPristine();
    this.formGroup.markAsUntouched();
  });

  onEscapeKey(): void {
    this.onCancel();
  }

  onSubmit(): void {
    if (this.formGroup.invalid) return;

    const payload = this.buildPayload();
    if (!payload) return;

    this.isSubmitting.set(true);

    const existing = this.initialMeasurement();
    const updateOrAddMeasurement = existing
      ? this.measurementService.updateRecentMeasurement(payload)
      : this.measurementService.addMeasurement(payload);

    updateOrAddMeasurement.subscribe({
      next: () => {
        this.notificationService.success(
          existing
            ? 'Your recent measurement has been successfully updated.'
            : 'Your measurements have been successfully saved.'
        );

        this.isSubmitting.set(false);
        this.formGroup.reset();
        this.success.emit();
      },
      error: () => {
        this.notificationService.error(
          existing ? 'Failed to update your recent measurement.' : 'Failed to save your measurements.'
        );
        this.isSubmitting.set(false);
      },
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  hasError(controlName: keyof MeasurementForm): boolean {
    const control = this.formGroup.get(controlName);
    return !!(control?.invalid && control.touched);
  }

  private buildPayload(): MeasurementPayload | null {
    const raw = this.formGroup.getRawValue();
    const weight = raw.weight;

    if (typeof weight !== 'number') return null;

    return {
      weight,
      waistCircumference: raw.waistCircumference ?? undefined,
      hipCircumference: raw.hipCircumference ?? undefined,
      chestCircumference: raw.chestCircumference ?? undefined,
      armCircumference: raw.armCircumference ?? undefined,
      thighCircumference: raw.thighCircumference ?? undefined,
      calfCircumference: raw.calfCircumference ?? undefined,
    };
  }
}
