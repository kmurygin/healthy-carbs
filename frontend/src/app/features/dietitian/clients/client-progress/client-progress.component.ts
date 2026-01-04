import {ChangeDetectionStrategy, Component, computed, DestroyRef, inject, type OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {catchError, finalize, tap} from 'rxjs/operators';
import {EMPTY, forkJoin, of} from 'rxjs';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {
  faArrowDown,
  faArrowUp,
  faCalculator,
  faChartColumn,
  faMinus,
  faRulerVertical,
  faWeightScale,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import {DietitianService} from '@core/services/dietitian/dietitian.service';
import type {UserMeasurement} from '@core/services/user-measurement/user-measurement.service';
import type {DietaryProfileDto} from '@core/models/dto/dietaryprofile.dto';
import type {UserDto} from '@core/models/dto/user.dto';
import {NotificationService} from '@core/services/ui/notification.service';
import {setErrorNotification} from '@shared/utils';
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

interface TrendValue {
  value: number | null;
  direction: 'up' | 'down' | 'equal' | null;
}

interface TableRow {
  date: string;
  data: Record<string, TrendValue>;
}

@Component({
  selector: 'app-client-progress',
  imports: [CommonModule, RouterLink, MeasurementChartCardComponent, FaIconComponent],
  templateUrl: './client-progress.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientProgressComponent implements OnInit {
  readonly faArrowUp = faArrowUp;
  readonly faArrowDown = faArrowDown;
  readonly faMinus = faMinus;
  readonly faRuler = faRulerVertical;
  readonly faWeight = faWeightScale;
  readonly faCalculator = faCalculator;
  readonly measurementTypes = MEASUREMENT_TYPES;
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly client = signal<UserDto | null>(null);
  readonly measurements = signal<UserMeasurement[]>([]);
  readonly dietaryProfile = signal<DietaryProfileDto | null>(null);
  readonly hasData = computed(() => this.measurements().length > 0);

  readonly bmi = computed(() => {
    const dietaryProfile = this.dietaryProfile();
    if (!dietaryProfile?.height || !dietaryProfile.weight) return null;

    const heightMeters = dietaryProfile.height / 100;
    if (heightMeters === 0) return null;

    return dietaryProfile.weight / (heightMeters * heightMeters);
  });

  readonly bmiCategory = computed(() => {
    const bodyMassIndex = this.bmi();
    if (bodyMassIndex === null) return null;

    if (bodyMassIndex < 18.5) return 'Underweight';
    if (bodyMassIndex < 25) return 'Normal weight';
    if (bodyMassIndex < 30) return 'Overweight';
    return 'Obese';
  });

  readonly sortedMeasurementsAsc = computed(() => {
    return [...this.measurements()].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  });

  readonly tableData = computed<TableRow[]>(() => {
    const userMeasurements: UserMeasurement[] = this.sortedMeasurementsAsc();

    const lastSeen = new Map<string, number>();

    const tableRows: TableRow[] = userMeasurements.map((measurement) => {
      const rowData: Record<string, TrendValue> = {};

      for (const type of this.measurementTypes) {
        const key = type.key;
        const raw = measurement[key];
        const value = typeof raw === 'number' ? raw : null;

        let direction: TrendValue['direction'] = null;

        if (value !== null) {
          const prev = lastSeen.get(key);
          if (prev !== undefined) {
            if (value > prev) direction = 'up';
            else if (value < prev) direction = 'down';
            else direction = 'equal';
          }
          lastSeen.set(key, value);
        }

        rowData[key] = {value, direction};
      }

      return {date: measurement.date, data: rowData};
    });

    return tableRows.reverse();
  });
  protected readonly faChartColumn = faChartColumn;
  private readonly route = inject(ActivatedRoute);
  private readonly dietitianService = inject(DietitianService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    const clientIdParam = this.route.snapshot.paramMap.get('clientId');
    const clientId = clientIdParam ? Number(clientIdParam) : NaN;

    if (!Number.isFinite(clientId)) {
      this.errorMessage.set('Invalid Client ID');
      this.isLoading.set(false);
      return;
    }

    this.loadData(clientId);
  }

  getTrendIcon(direction: TrendValue['direction']): IconDefinition | undefined {
    switch (direction) {
      case 'up':
        return this.faArrowUp;
      case 'down':
        return this.faArrowDown;
      case 'equal':
        return this.faMinus;
      default:
        return undefined;
    }
  }

  getTrendColorClass(direction: TrendValue['direction']): string {
    switch (direction) {
      case 'up':
        return 'text-red-500';
      case 'down':
        return 'text-emerald-500';
      case 'equal':
        return 'text-gray-300';
      default:
        return '';
    }
  }

  private loadData(clientId: number): void {
    this.isLoading.set(true);

    forkJoin({
      measurements: this.dietitianService.getClientMeasurements(clientId),
      profile: this.dietitianService.getClientDietaryProfile(clientId).pipe(catchError(() => of(null))),
    })
      .pipe(
        tap(({measurements, profile}) => {
          this.measurements.set(measurements);
          this.dietaryProfile.set(profile);

          if (!this.client() && profile?.user) {
            this.client.set(profile.user);
          }
        }),
        finalize(() => {
          this.isLoading.set(false)
        }),
        catchError((error: unknown) => {
          this.errorMessage.set('Failed to load client data.');
          setErrorNotification(this.notificationService, error, 'Could not load client data.');
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
}
