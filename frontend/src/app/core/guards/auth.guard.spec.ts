import {TestBed} from '@angular/core/testing';
import type {ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Router} from '@angular/router';
import {signal} from '@angular/core';
import type {MockedObject} from 'vitest';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import {authGuard} from './auth.guard';
import {AuthService} from '../services/auth/auth.service';

describe('authGuard', () => {
  let authServiceMock: MockedObject<Partial<AuthService>>;
  let routerMock: MockedObject<Partial<Router>>;
  const fakeUrlTree = {} as unknown as UrlTree;

  beforeEach(() => {
    authServiceMock = {
      isLoggedIn: signal(true),
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

  it('authGuard_whenUserLoggedIn_shouldReturnTrue', () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as unknown as ActivatedRouteSnapshot, {} as unknown as RouterStateSnapshot)
    );
    expect(result).toBe(true);
  });

  it('authGuard_whenUserNotLoggedIn_shouldRedirectToIndex', () => {
    authServiceMock = {
      isLoggedIn: signal(false),
    } as unknown as MockedObject<Partial<AuthService>>;
    TestBed.overrideProvider(AuthService, {useValue: authServiceMock});

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as unknown as ActivatedRouteSnapshot, {} as unknown as RouterStateSnapshot)
    );
    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/index']);
    expect(result).toBe(fakeUrlTree);
  });
});
