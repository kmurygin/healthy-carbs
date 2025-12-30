import {TestBed} from '@angular/core/testing';

import {DietitianService} from './dietitian.service';

describe('DietitianService', () => {
  let service: DietitianService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DietitianService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
