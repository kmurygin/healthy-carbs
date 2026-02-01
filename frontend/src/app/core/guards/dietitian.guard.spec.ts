import {TestBed} from '@angular/core/testing';
import type {ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Router} from '@angular/router';
import {signal} from '@angular/core';
import type {MockedObject} from 'vitest';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import {dietitianGuard} from './dietitian.guard';
import {AuthService} from '../services/auth/auth.service';

describe('dietitianGuard', () => {
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

  it('dietitianGuard_whenRoleIsDietitian_shouldReturnTrue', () => {
    authServiceMock = {
      claims: signal({role: 'DIETITIAN'}),
    } as unknown as MockedObject<Partial<AuthService>>;
    TestBed.overrideProvider(AuthService, {useValue: authServiceMock});

    const result = TestBed.runInInjectionContext(() =>
      dietitianGuard({} as unknown as ActivatedRouteSnapshot, {} as unknown as RouterStateSnapshot)
    );
    expect(result).toBe(true);
  });

  it('dietitianGuard_whenRoleIsAdmin_shouldReturnTrue', () => {
    authServiceMock = {
      claims: signal({role: 'ADMIN'}),
    } as unknown as MockedObject<Partial<AuthService>>;
    TestBed.overrideProvider(AuthService, {useValue: authServiceMock});

    const result = TestBed.runInInjectionContext(() =>
      dietitianGuard({} as unknown as ActivatedRouteSnapshot, {} as unknown as RouterStateSnapshot)
    );
    expect(result).toBe(true);
  });

  it('dietitianGuard_whenRoleIsUser_shouldRedirectToRoot', () => {
    authServiceMock = {
      claims: signal({role: 'USER'}),
    } as unknown as MockedObject<Partial<AuthService>>;
    TestBed.overrideProvider(AuthService, {useValue: authServiceMock});

    const result = TestBed.runInInjectionContext(() =>
      dietitianGuard({} as unknown as ActivatedRouteSnapshot, {} as unknown as RouterStateSnapshot)
    );
    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/']);
    expect(result).toBe(fakeUrlTree);
  });

  it('dietitianGuard_whenClaimsNull_shouldRedirectToRoot', () => {
    const result = TestBed.runInInjectionContext(() =>
      dietitianGuard({} as unknown as ActivatedRouteSnapshot, {} as unknown as RouterStateSnapshot)
    );
    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/']);
    expect(result).toBe(fakeUrlTree);
  });
});
