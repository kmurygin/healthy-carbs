import {TestBed} from '@angular/core/testing';
import type {UrlTree} from '@angular/router';
import {Router} from '@angular/router';
import {signal} from '@angular/core';
import type {MockedObject} from 'vitest';
import {vi} from 'vitest';

import {AuthService} from '@core/services/auth/auth.service';

export interface GuardTestContext {
  authServiceMock: MockedObject<Partial<AuthService>>;
  routerMock: MockedObject<Partial<Router>>;
  fakeUrlTree: UrlTree;
}

export function setupGuardTest(): GuardTestContext {
  const fakeUrlTree = {} as unknown as UrlTree;

  const authServiceMock = {
    claims: signal(null),
  } as unknown as MockedObject<Partial<AuthService>>;

  const routerMock = {
    createUrlTree: vi.fn().mockReturnValue(fakeUrlTree),
  } as unknown as MockedObject<Partial<Router>>;

  TestBed.configureTestingModule({
    providers: [
      {provide: AuthService, useValue: authServiceMock},
      {provide: Router, useValue: routerMock},
    ],
  });

  return {authServiceMock, routerMock, fakeUrlTree};
}

export function overrideAuthServiceWithClaims(claims: Record<string, unknown> | null): MockedObject<Partial<AuthService>> {
  const authServiceMock = {
    claims: signal(claims),
  } as unknown as MockedObject<Partial<AuthService>>;
  TestBed.overrideProvider(AuthService, {useValue: authServiceMock});
  return authServiceMock;
}
