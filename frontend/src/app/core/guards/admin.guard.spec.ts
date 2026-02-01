import {TestBed} from '@angular/core/testing';
import type {ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Router} from '@angular/router';
import {signal} from '@angular/core';
import type {MockedObject} from 'vitest';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import {adminGuard} from './admin.guard';
import {AuthService} from '../services/auth/auth.service';
import {UserRole} from '@core/models/enum/user-role.enum';

describe('adminGuard', () => {
  let authServiceMock: MockedObject<Partial<AuthService>>;
  let routerMock: MockedObject<Partial<Router>>;
  const fakeUrlTree = {} as unknown as UrlTree;

  beforeEach(() => {
    authServiceMock = {
      claims: signal(null),
    } as unknown as MockedObject<Partial<AuthService>>;

    routerMock = {
      createUrlTree: vi.fn().mockReturnValue(fakeUrlTree),
    } as unknown as MockedObject<Partial<Router>>;

    TestBed.configureTestingModule({
      providers: [
        {provide: AuthService, useValue: authServiceMock},
        {provide: Router, useValue: routerMock},
      ],
    });
  });

  it('adminGuard_whenRoleIsAdmin_shouldReturnTrue', () => {
    authServiceMock = {
      claims: signal({role: UserRole.ADMIN}),
    } as unknown as MockedObject<Partial<AuthService>>;
    TestBed.overrideProvider(AuthService, {useValue: authServiceMock});

    const result = TestBed.runInInjectionContext(() =>
      adminGuard({} as unknown as ActivatedRouteSnapshot, {} as unknown as RouterStateSnapshot)
    );
    expect(result).toBe(true);
  });

  it('adminGuard_whenRoleIsUser_shouldRedirectToRoot', () => {
    authServiceMock = {
      claims: signal({role: UserRole.USER}),
    } as unknown as MockedObject<Partial<AuthService>>;
    TestBed.overrideProvider(AuthService, {useValue: authServiceMock});

    const result = TestBed.runInInjectionContext(() =>
      adminGuard({} as unknown as ActivatedRouteSnapshot, {} as unknown as RouterStateSnapshot)
    );
    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/']);
    expect(result).toBe(fakeUrlTree);
  });

  it('adminGuard_whenRoleIsDietitian_shouldRedirectToRoot', () => {
    authServiceMock = {
      claims: signal({role: UserRole.DIETITIAN}),
    } as unknown as MockedObject<Partial<AuthService>>;
    TestBed.overrideProvider(AuthService, {useValue: authServiceMock});

    const result = TestBed.runInInjectionContext(() =>
      adminGuard({} as unknown as ActivatedRouteSnapshot, {} as unknown as RouterStateSnapshot)
    );
    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/']);
    expect(result).toBe(fakeUrlTree);
  });

  it('adminGuard_whenClaimsNull_shouldRedirectToRoot', () => {
    const result = TestBed.runInInjectionContext(() =>
      adminGuard({} as unknown as ActivatedRouteSnapshot, {} as unknown as RouterStateSnapshot)
    );
    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/']);
    expect(result).toBe(fakeUrlTree);
  });
});
