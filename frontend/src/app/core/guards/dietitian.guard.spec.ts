import {TestBed} from '@angular/core/testing';
import type {ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {beforeEach, describe, expect, it} from 'vitest';

import {dietitianGuard} from './dietitian.guard';
import {type GuardTestContext, overrideAuthServiceWithClaims, setupGuardTest} from '@testing/guard-test.util';

describe('dietitianGuard', () => {
  let ctx: GuardTestContext;

  beforeEach(() => {
    ctx = setupGuardTest();
  });

  it('dietitianGuard_whenRoleIsDietitian_shouldReturnTrue', () => {
    overrideAuthServiceWithClaims({role: 'DIETITIAN'});

    const result = TestBed.runInInjectionContext(() =>
      dietitianGuard({} as unknown as ActivatedRouteSnapshot, {} as unknown as RouterStateSnapshot)
    );
    expect(result).toBe(true);
  });

  it('dietitianGuard_whenRoleIsAdmin_shouldReturnTrue', () => {
    overrideAuthServiceWithClaims({role: 'ADMIN'});

    const result = TestBed.runInInjectionContext(() =>
      dietitianGuard({} as unknown as ActivatedRouteSnapshot, {} as unknown as RouterStateSnapshot)
    );
    expect(result).toBe(true);
  });

  it('dietitianGuard_whenRoleIsUser_shouldRedirectToRoot', () => {
    overrideAuthServiceWithClaims({role: 'USER'});

    const result = TestBed.runInInjectionContext(() =>
      dietitianGuard({} as unknown as ActivatedRouteSnapshot, {} as unknown as RouterStateSnapshot)
    );
    expect(ctx.routerMock.createUrlTree).toHaveBeenCalledWith(['/']);
    expect(result).toBe(ctx.fakeUrlTree);
  });

  it('dietitianGuard_whenClaimsNull_shouldRedirectToRoot', () => {
    const result = TestBed.runInInjectionContext(() =>
      dietitianGuard({} as unknown as ActivatedRouteSnapshot, {} as unknown as RouterStateSnapshot)
    );
    expect(ctx.routerMock.createUrlTree).toHaveBeenCalledWith(['/']);
    expect(result).toBe(ctx.fakeUrlTree);
  });
});
