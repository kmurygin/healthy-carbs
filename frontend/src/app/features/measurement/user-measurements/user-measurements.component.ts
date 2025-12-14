import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {toObservable, toSignal} from "@angular/core/rxjs-interop";
import {switchMap} from "rxjs";
import {type UserMeasurement, UserMeasurementService} from "@core/services/user-measurement/user-measurement.service";
import {NotificationService} from "@core/services/ui/notification.service";
import {MeasurementFormComponent} from '../measurement-form/measurement-form.component';
import {
  MeasurementChartCardComponent,
  type MeasurementTypeDefinition
} from "@features/measurement/measurement-chart-card/measurement-chart-card.component";

const MEASUREMENT_TYPES: MeasurementTypeDefinition[] = [
  {key: 'weight', label: 'Weight', unit: 'kg'},
  {key: 'waistCircumference', label: 'Waist', unit: 'cm'},
  {key: 'hipCircumference', label: 'Hips', unit: 'cm'},
  {key: 'chestCircumference', label: 'Chest', unit: 'cm'},
  {key: 'armCircumference', label: 'Arm', unit: 'cm'},
  {key: 'thighCircumference', label: 'Thigh', unit: 'cm'},
  {key: 'calfCircumference', label: 'Calf', unit: 'cm'}
];

@Component({
  selector: 'app-user-measurements',
  imports: [CommonModule, MeasurementFormComponent, MeasurementChartCardComponent],
  templateUrl: './user-measurements.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserMeasurementsComponent {
  readonly showForm = signal(false);
  readonly measurementTypes = MEASUREMENT_TYPES;
  private readonly measurementService = inject(UserMeasurementService);
  private readonly notificationService = inject(NotificationService);
  private readonly refreshTrigger = signal(0);
  readonly historyData = toSignal(
    toObservable(this.refreshTrigger).pipe(
      switchMap(() => this.measurementService.getAllHistory())
    ),
    {initialValue: [] as UserMeasurement[]}
  );

  toggleForm(): void {
    if (this.showForm()) {
      this.showForm.set(false);
      return;
    }

    const historyItems = this.historyData() ?? [];

    if (historyItems.length === 0) {
      this.showForm.set(true);
      return;
    }

    const {allowed, remainingMs} = this.measurementService.canAddMeasurement(historyItems);

    if (!allowed) {
      this.notificationService.error(
        `You can add another measurement only after 24 hours have passed since the last entry.\n
         Time remaining: ${this.getFormattedTimeRemaining(remainingMs)}.`
      );
      return;
    }

    this.showForm.set(true);
  }

  onFormSuccess(): void {
    this.showForm.set(false);
    this.refreshTrigger.update(value => value + 1);
  }

  private getFormattedTimeRemaining(remainingMs: number): string {
    const totalMinutes = Math.ceil(remainingMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours} hours and ${minutes} minutes`;
  }
}
