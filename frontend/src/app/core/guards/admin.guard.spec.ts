import {TestBed} from '@angular/core/testing';
import {adminGuard} from './admin.guard';
import {AuthService} from '../services/auth/auth.service';
import {Router} from '@angular/router';
import {signal} from '@angular/core';
import type {MockedObject} from 'vitest';
import {beforeEach, describe, expect, it, vi} from 'vitest';

describe('adminGuard', () => {
  let authServiceMock: MockedObject<Partial<AuthService>>;
  let routerMock: MockedObject<Partial<Router>>;

  beforeEach(() => {
    authServiceMock = {
      claims: signal(null)
    } as unknown as MockedObject<Partial<AuthService>>;

    routerMock = {
      createUrlTree: vi.fn()
    } as unknown as MockedObject<Partial<Router>>;

    TestBed.configureTestingModule({
      providers: [
        {provide: AuthService, useValue: authServiceMock},
        {provide: Router, useValue: routerMock}
      ]
    });
  });

  it('should be created', () => {
    expect(adminGuard).toBeTruthy();
  });
});
