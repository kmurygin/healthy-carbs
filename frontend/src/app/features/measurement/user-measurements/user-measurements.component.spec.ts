import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {of} from 'rxjs';

import {UserMeasurementsComponent} from './user-measurements.component';
import {UserMeasurementService} from '@core/services/user-measurement/user-measurement.service';
import {DietaryProfileService} from '@core/services/dietary-profile/dietary-profile.service';

describe('UserMeasurementsComponent', () => {
  let component: UserMeasurementsComponent;
  let fixture: ComponentFixture<UserMeasurementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserMeasurementsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: UserMeasurementService,
          useValue: {
            getAllHistory: () => of([]),
            canAddMeasurement: () => ({allowed: true, remainingMs: 0}),
          },
        },
        {
          provide: DietaryProfileService,
          useValue: {
            getProfile: () => of(null),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserMeasurementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
