import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {switchMap} from 'rxjs';
import {type UserMeasurement, UserMeasurementService,} from '@core/services/user-measurement/user-measurement.service';
import {NotificationService} from '@core/services/ui/notification.service';
import {DietaryProfileService} from '@core/services/dietary-profile/dietary-profile.service';
import {MeasurementFormComponent} from '../measurement-form/measurement-form.component';
import {
  MeasurementChartCardComponent,
  type MeasurementTypeDefinition,
} from '@features/measurement/measurement-chart-card/measurement-chart-card.component';

const MEASUREMENT_TYPES: MeasurementTypeDefinition[] = [
  {key: 'weight', label: 'Weight', unit: 'kg'},
  {key: 'waistCircumference', label: 'Waist', unit: 'cm'},
  {key: 'hipCircumference', label: 'Hips', unit: 'cm'},
  {key: 'chestCircumference', label: 'Chest', unit: 'cm'},
  {key: 'armCircumference', label: 'Arm', unit: 'cm'},
  {key: 'thighCircumference', label: 'Thigh', unit: 'cm'},
  {key: 'calfCircumference', label: 'Calf', unit: 'cm'},
];

@Component({
  selector: 'app-user-measurements',
  imports: [CommonModule, MeasurementFormComponent, MeasurementChartCardComponent],
  templateUrl: './user-measurements.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMeasurementsComponent {
  readonly measurementTypes = MEASUREMENT_TYPES;

  readonly showForm = signal(false);
  readonly editingMeasurement = signal<UserMeasurement | null>(null);
  readonly bmiCategory = computed<string | null>(() => {
    const bmi = this.bmi();
    if (bmi === null) return null;
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  });
  private readonly measurementService = inject(UserMeasurementService);
  private readonly notificationService = inject(NotificationService);
  private readonly dietaryProfileService = inject(DietaryProfileService);
  readonly dietaryProfile = toSignal(this.dietaryProfileService.getProfile(), {initialValue: null});
  readonly bmi = computed<number | null>(() => {
    const profile = this.dietaryProfile();
    const latest = this.latestMeasurement();
    const weight = latest?.weight ?? profile?.weight;
    const height = profile?.height;
    if (!weight || !height || height === 0) return null;
    const heightM = height / 100;
    return Math.round((weight / (heightM * heightM)) * 10) / 10;
  });
  private readonly refreshTrigger = signal(0);
  readonly historyData = toSignal(
    toObservable(this.refreshTrigger).pipe(switchMap(() => this.measurementService.getAllHistory())),
    {initialValue: [] as UserMeasurement[]}
  );
  readonly latestMeasurement = computed<UserMeasurement | null>(() => {
    const userMeasurements: UserMeasurement[] = this.historyData() ?? [];
    if (userMeasurements.length === 0) return null;

    let latest: UserMeasurement = userMeasurements[0];
    for (const measurement of userMeasurements) {
      if (new Date(measurement.date).getTime() > new Date(latest.date).getTime()) {
        latest = measurement;
      }
    }
    return latest;
  });

  openAddForm(): void {
    this.editingMeasurement.set(null);

    const historyItems = this.historyData() ?? [];
    if (historyItems.length === 0) {
      this.showForm.set(true);
      return;
    }

    const {allowed, remainingMs} = this.measurementService.canAddMeasurement(historyItems);

    if (!allowed) {
      this.notificationService.error(
        `You can add another measurement only after 24 hours have passed since the last entry.\n` +
        `Time remaining: ${this.getFormattedTimeRemaining(remainingMs)}.`
      );
      return;
    }

    this.showForm.set(true);
  }

  openEditRecentForm(): void {
    const latest = this.latestMeasurement();
    if (!latest) {
      this.notificationService.error('No measurement history found to edit.');
      return;
    }

    this.editingMeasurement.set(latest);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingMeasurement.set(null);
  }

  onFormSuccess(): void {
    this.closeForm();
    this.refreshTrigger.update((value) => value + 1);
  }

  private getFormattedTimeRemaining(remainingMs: number): string {
    const totalMinutes = Math.ceil(remainingMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours} hours and ${minutes} minutes`;
  }
}
