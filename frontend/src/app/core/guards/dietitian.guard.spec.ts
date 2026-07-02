import {TestBed} from '@angular/core/testing';
import {beforeEach, describe, expect, it} from 'vitest';

import {dietitianGuard} from './dietitian.guard';
import {UserRole} from '@core/models/enum/user-role.enum';
import {
  dummyRoute,
  dummySegments,
  dummySnapshot,
  type GuardTestContext,
  overrideAuthServiceWithClaims,
  setupGuardTest,
} from '@testing/guard-test.util';

describe('dietitianGuard', () => {
  let ctx: GuardTestContext;

  beforeEach(() => {
    ctx = setupGuardTest();
  });

  it('dietitianGuard_whenRoleIsDietitian_shouldReturnTrue', () => {
    overrideAuthServiceWithClaims({role: UserRole.DIETITIAN});

    const result = TestBed.runInInjectionContext(() =>
      dietitianGuard(dummyRoute, dummySegments, dummySnapshot)
    );
    expect(result).toBe(true);
  });

  it('dietitianGuard_whenRoleIsAdmin_shouldReturnTrue', () => {
    overrideAuthServiceWithClaims({role: UserRole.ADMIN});

    const result = TestBed.runInInjectionContext(() =>
      dietitianGuard(dummyRoute, dummySegments, dummySnapshot)
    );
    expect(result).toBe(true);
  });

  it('dietitianGuard_whenRoleIsUser_shouldRedirectToRoot', () => {
    overrideAuthServiceWithClaims({role: UserRole.USER});

    const result = TestBed.runInInjectionContext(() =>
      dietitianGuard(dummyRoute, dummySegments, dummySnapshot)
    );
    expect(ctx.routerMock.createUrlTree).toHaveBeenCalledWith(['/']);
    expect(result).toBe(ctx.fakeUrlTree);
  });

  it('dietitianGuard_whenClaimsNull_shouldRedirectToIndex', () => {
    const result = TestBed.runInInjectionContext(() =>
      dietitianGuard(dummyRoute, dummySegments, dummySnapshot)
    );
    expect(ctx.routerMock.createUrlTree).toHaveBeenCalledWith(['/']);
    expect(result).toBe(ctx.fakeUrlTree);
  });
});
