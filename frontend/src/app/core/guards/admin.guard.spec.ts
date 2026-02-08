import {TestBed} from '@angular/core/testing';
import type {ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {beforeEach, describe, expect, it} from 'vitest';

import {adminGuard} from './admin.guard';
import {UserRole} from '@core/models/enum/user-role.enum';
import {type GuardTestContext, overrideAuthServiceWithClaims, setupGuardTest} from '@testing/guard-test.util';

describe('adminGuard', () => {
  let ctx: GuardTestContext;

  beforeEach(() => {
    ctx = setupGuardTest();
  });

  it('adminGuard_whenRoleIsAdmin_shouldReturnTrue', () => {
    overrideAuthServiceWithClaims({role: UserRole.ADMIN});

    const result = TestBed.runInInjectionContext(() =>
      adminGuard({} as unknown as ActivatedRouteSnapshot, {} as unknown as RouterStateSnapshot)
    );
    expect(result).toBe(true);
  });

  it('adminGuard_whenRoleIsUser_shouldRedirectToRoot', () => {
    overrideAuthServiceWithClaims({role: UserRole.USER});

    const result = TestBed.runInInjectionContext(() =>
      adminGuard({} as unknown as ActivatedRouteSnapshot, {} as unknown as RouterStateSnapshot)
    );
    expect(ctx.routerMock.createUrlTree).toHaveBeenCalledWith(['/']);
    expect(result).toBe(ctx.fakeUrlTree);
  });

  it('adminGuard_whenRoleIsDietitian_shouldRedirectToRoot', () => {
    overrideAuthServiceWithClaims({role: UserRole.DIETITIAN});

    const result = TestBed.runInInjectionContext(() =>
      adminGuard({} as unknown as ActivatedRouteSnapshot, {} as unknown as RouterStateSnapshot)
    );
    expect(ctx.routerMock.createUrlTree).toHaveBeenCalledWith(['/']);
    expect(result).toBe(ctx.fakeUrlTree);
  });

  it('adminGuard_whenClaimsNull_shouldRedirectToRoot', () => {
    const result = TestBed.runInInjectionContext(() =>
      adminGuard({} as unknown as ActivatedRouteSnapshot, {} as unknown as RouterStateSnapshot)
    );
    expect(ctx.routerMock.createUrlTree).toHaveBeenCalledWith(['/']);
    expect(result).toBe(ctx.fakeUrlTree);
  });
});
