import {TestBed} from '@angular/core/testing';
import type {CanActivateFn} from '@angular/router';

import {dietitianGuard} from './dietitian.guard';

describe('dietitianGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => dietitianGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
