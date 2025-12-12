import {TestBed} from '@angular/core/testing';

import {UserMeasurementService} from './user-measurement.service';

describe('UserMeasurementService', () => {
  let service: UserMeasurementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserMeasurementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
