import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {of} from 'rxjs';

import {ClientProgressComponent} from './client-progress.component';
import {DietitianService} from '@core/services/dietitian/dietitian.service';

describe('ClientProgressComponent', () => {
  let component: ClientProgressComponent;
  let fixture: ComponentFixture<ClientProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientProgressComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: DietitianService,
          useValue: {
            getClientDetails: () => of(null),
            getClientMeasurements: () => of([]),
            getClientDietaryProfile: () => of(null),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
