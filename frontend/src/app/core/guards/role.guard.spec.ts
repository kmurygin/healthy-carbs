import {TestBed} from '@angular/core/testing';
import type {ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Router} from '@angular/router';
import {signal} from '@angular/core';
import type {MockedObject} from 'vitest';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import {createAuthStateGuard, createRoleGuard} from './role.guard';
import {UserRole} from '@core/models/enum/user-role.enum';
import {AuthService} from '../services/auth/auth.service';

const dummyRoute = {} as unknown as ActivatedRouteSnapshot;
const dummyState = {} as unknown as RouterStateSnapshot;

describe('createRoleGuard', () => {
  let routerMock: MockedObject<Partial<Router>>;
  const fakeUrlTree = {} as unknown as UrlTree;

  function provideAuthWithClaims(claims: Record<string, unknown> | null): void {
    const mock = {claims: signal(claims)} as unknown as MockedObject<Partial<AuthService>>;
    TestBed.overrideProvider(AuthService, {useValue: mock});
  }

  beforeEach(() => {
    routerMock = {
      createUrlTree: vi.fn().mockReturnValue(fakeUrlTree),
    } as unknown as MockedObject<Partial<Router>>;

    TestBed.configureTestingModule({
      providers: [
        {provide: AuthService, useValue: {claims: signal(null)}},
        {provide: Router, useValue: routerMock},
      ],
    });
  });

  it('should_returnTrue_when_singleAllowedRoleMatches', () => {
    provideAuthWithClaims({role: UserRole.ADMIN});
    const guard = createRoleGuard(UserRole.ADMIN);

    const result = TestBed.runInInjectionContext(() => guard(dummyRoute, dummyState));

    expect(result).toBe(true);
  });

  it('should_redirect_when_singleAllowedRoleDoesNotMatch', () => {
    provideAuthWithClaims({role: UserRole.USER});
    const guard = createRoleGuard(UserRole.ADMIN);

    const result = TestBed.runInInjectionContext(() => guard(dummyRoute, dummyState));

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/']);
    expect(result).toBe(fakeUrlTree);
  });

  it('should_returnTrue_when_multipleRolesAllowedAndFirstMatches', () => {
    provideAuthWithClaims({role: UserRole.DIETITIAN});
    const guard = createRoleGuard(UserRole.DIETITIAN, UserRole.ADMIN);

    const result = TestBed.runInInjectionContext(() => guard(dummyRoute, dummyState));

    expect(result).toBe(true);
  });

  it('should_returnTrue_when_multipleRolesAllowedAndSecondMatches', () => {
    provideAuthWithClaims({role: UserRole.ADMIN});
    const guard = createRoleGuard(UserRole.DIETITIAN, UserRole.ADMIN);

    const result = TestBed.runInInjectionContext(() => guard(dummyRoute, dummyState));

    expect(result).toBe(true);
  });

  it('should_redirect_when_multipleRolesAllowedAndNoneMatch', () => {
    provideAuthWithClaims({role: UserRole.USER});
    const guard = createRoleGuard(UserRole.DIETITIAN, UserRole.ADMIN);

    const result = TestBed.runInInjectionContext(() => guard(dummyRoute, dummyState));

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/']);
    expect(result).toBe(fakeUrlTree);
  });

  it('should_redirect_when_claimsAreNull', () => {
    const guard = createRoleGuard(UserRole.ADMIN);

    const result = TestBed.runInInjectionContext(() => guard(dummyRoute, dummyState));

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/']);
    expect(result).toBe(fakeUrlTree);
  });

  it('should_redirect_when_roleIsUnknownString', () => {
    provideAuthWithClaims({role: 'UNKNOWN_ROLE'});
    const guard = createRoleGuard(UserRole.ADMIN, UserRole.USER, UserRole.DIETITIAN);

    const result = TestBed.runInInjectionContext(() => guard(dummyRoute, dummyState));

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/']);
    expect(result).toBe(fakeUrlTree);
  });
});

describe('createAuthStateGuard', () => {
  let routerMock: MockedObject<Partial<Router>>;
  const fakeUrlTree = {} as unknown as UrlTree;

  function provideAuthWithLoginState(isLoggedIn: boolean): void {
    const mock = {isLoggedIn: signal(isLoggedIn)} as unknown as MockedObject<Partial<AuthService>>;
    TestBed.overrideProvider(AuthService, {useValue: mock});
  }

  beforeEach(() => {
    routerMock = {
      createUrlTree: vi.fn().mockReturnValue(fakeUrlTree),
    } as unknown as MockedObject<Partial<Router>>;

    TestBed.configureTestingModule({
      providers: [
        {provide: AuthService, useValue: {isLoggedIn: signal(false)}},
        {provide: Router, useValue: routerMock},
      ],
    });
  });

  it('should_returnTrue_when_requireAuthTrueAndUserLoggedIn', () => {
    provideAuthWithLoginState(true);
    const guard = createAuthStateGuard(true, '/login');

    const result = TestBed.runInInjectionContext(() => guard(dummyRoute, dummyState));

    expect(result).toBe(true);
  });

  it('should_redirect_when_requireAuthTrueAndUserNotLoggedIn', () => {
    provideAuthWithLoginState(false);
    const guard = createAuthStateGuard(true, '/login');

    const result = TestBed.runInInjectionContext(() => guard(dummyRoute, dummyState));

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toBe(fakeUrlTree);
  });

  it('should_returnTrue_when_requireAuthFalseAndUserNotLoggedIn', () => {
    provideAuthWithLoginState(false);
    const guard = createAuthStateGuard(false, '/');

    const result = TestBed.runInInjectionContext(() => guard(dummyRoute, dummyState));

    expect(result).toBe(true);
  });

  it('should_redirect_when_requireAuthFalseAndUserLoggedIn', () => {
    provideAuthWithLoginState(true);
    const guard = createAuthStateGuard(false, '/');

    const result = TestBed.runInInjectionContext(() => guard(dummyRoute, dummyState));

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/']);
    expect(result).toBe(fakeUrlTree);
  });

  it('should_useCustomRedirectPath', () => {
    provideAuthWithLoginState(false);
    const guard = createAuthStateGuard(true, '/custom-redirect');

    const result = TestBed.runInInjectionContext(() => guard(dummyRoute, dummyState));

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/custom-redirect']);
    expect(result).toBe(fakeUrlTree);
  });
});
