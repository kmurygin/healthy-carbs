import {TestBed} from '@angular/core/testing';

import {DietaryProfileService} from './dietary-profile.service';

describe('DietaryProfileService', () => {
  let service: DietaryProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DietaryProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
