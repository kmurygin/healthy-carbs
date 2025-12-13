import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MeasurementFormComponent} from '../measurement-form/measurement-form.component';
import {NgApexchartsModule} from 'ng-apexcharts';
import type {UserMeasurement} from "@core/services/user-measurement/user-measurement.service";
import {UserMeasurementService} from "@core/services/user-measurement/user-measurement.service";
import {NotificationService} from "@core/services/ui/notification.service";
import {toObservable, toSignal} from "@angular/core/rxjs-interop";
import {switchMap} from "rxjs";
import {createChartOptions, getSeriesData} from "@features/measurement/measurement.utils";

type MeasurementKey = keyof Pick<UserMeasurement,
  'weight' |
  'waistCircumference' |
  'hipCircumference' |
  'chestCircumference' |
  'armCircumference' |
  'thighCircumference' |
  'calfCircumference'
>;

interface MeasurementType {
  key: MeasurementKey,
  label: string,
  unit: string,
  colour: string
}

const measurementTypes: MeasurementType[] = [
  {key: 'weight', label: 'Weight', unit: 'kg', colour: '#10B981'},
  {key: 'waistCircumference', label: 'Waist', unit: 'cm', colour: '#10B981'},
  {key: 'hipCircumference', label: 'Hips', unit: 'cm', colour: '#10B981'},
  {key: 'chestCircumference', label: 'Chest', unit: 'cm', colour: '#10B981'},
  {key: 'armCircumference', label: 'Arm', unit: 'cm', colour: '#10B981'},
  {key: 'thighCircumference', label: 'Thigh', unit: 'cm', colour: '#10B981'},
  {key: 'calfCircumference', label: 'Calf', unit: 'cm', colour: '#10B981'}
] as const;

@Component({
  selector: 'app-user-measurements',
  imports: [CommonModule, MeasurementFormComponent, NgApexchartsModule],
  templateUrl: './user-measurements.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserMeasurementsComponent {
  readonly showForm = signal(false);
  private readonly measurementService = inject(UserMeasurementService);
  private readonly notificationService = inject(NotificationService);
  private readonly refreshTrigger = signal(0);
  readonly historyData = toSignal(
    toObservable(this.refreshTrigger).pipe(
      switchMap(() => this.measurementService.getAllHistory())
    ),
    {initialValue: [] as UserMeasurement[]}
  );
  readonly charts = computed(() => {
    const data = this.historyData() ?? [];
    return measurementTypes.map(type => {
      const seriesData = getSeriesData(data, type.key);

      if (seriesData.length === 0) {
        return {label: type.label, hasData: false, options: null};
      }

      return {
        label: type.label,
        hasData: true,
        options: createChartOptions(type.label, type.unit, type.colour, seriesData)
      };
    });
  });

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
        `You can add another measurement only after 24 hours have passed since the last entry. \n
       Time remaining: ${this.getFormattedTimeRemaining(remainingMs)}.`
      );
      return;
    }

    this.showForm.set(true);
  }

  onFormSuccess(): void {
    this.showForm.set(false);
    this.refreshTrigger.update(v => v + 1);
  }

  private getFormattedTimeRemaining(remainingMs: number): string {
    const totalMinutes = Math.ceil(remainingMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours} hours and ${minutes} minutes`;
  }
}
