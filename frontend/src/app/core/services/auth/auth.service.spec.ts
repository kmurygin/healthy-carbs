import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {of} from 'rxjs';

import {AuthService} from './auth.service';
import {UserService} from '../user/user.service';
import {ApiEndpoints} from '../../constants/api-endpoints';
import {LocalStorage} from '../../constants/constants';

function createJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({alg: 'HS256', typ: 'JWT'}));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.fake-signature`;
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let userServiceMock: Partial<UserService>;

  const validClaims = {
    sub: 'testuser',
    id: 42,
    role: 'ADMIN',
    iat: Math.floor(Date.now() / 1000) - 60,
    exp: Math.floor(Date.now() / 1000) + 3600,
  };

  beforeEach(() => {
    localStorage.clear();

    routerMock = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    userServiceMock = {
      refreshUserByUsername: vi.fn().mockReturnValue(of(null)),
      clearCurrentUser: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        {provide: Router, useValue: routerMock},
        {provide: UserService, useValue: userServiceMock},
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('service_whenInjected_shouldBeTruthy', () => {
    expect(service).toBeTruthy();
  });

  describe('isTokenExpired', () => {
    it('isTokenExpired_whenNoToken_shouldReturnTrue', () => {
      expect(service.isTokenExpired()).toBe(true);
    });

    it('isTokenExpired_whenClaimsHaveNoExp_shouldReturnTrue', () => {
      const token = createJwt({sub: 'testuser', id: 1});
      localStorage.setItem(LocalStorage.token, token);
      service = TestBed.inject(AuthService);
      expect(service.isTokenExpired()).toBe(true);
    });

    it('isTokenExpired_whenTokenExpired_shouldReturnTrue', () => {
      const expiredClaims = {...validClaims, exp: Math.floor(Date.now() / 1000) - 60};
      const token = createJwt(expiredClaims);
      service.login({username: 'test', password: 'pass'}).subscribe();
      const req = httpMock.expectOne(ApiEndpoints.Auth.Login);
      req.flush({status: true, data: {token}});
      expect(service.isTokenExpired()).toBe(true);
    });

    it('isTokenExpired_whenTokenValid_shouldReturnFalse', () => {
      const token = createJwt(validClaims);
      service.login({username: 'test', password: 'pass'}).subscribe();
      const req = httpMock.expectOne(ApiEndpoints.Auth.Login);
      req.flush({status: true, data: {token}});
      expect(service.isTokenExpired()).toBe(false);
    });
  });

  describe('claims', () => {
    it('claims_whenNoToken_shouldReturnNull', () => {
      expect(service.claims()).toBeNull();
    });

    it('claims_whenValidToken_shouldReturnDecodedClaims', () => {
      const token = createJwt(validClaims);
      service.login({username: 'test', password: 'pass'}).subscribe();
      const req = httpMock.expectOne(ApiEndpoints.Auth.Login);
      req.flush({status: true, data: {token}});
      const claims = service.claims();
      expect(claims).not.toBeNull();
      expect(claims!.sub).toBe('testuser');
      expect(claims!.id).toBe(42);
      expect(claims!.role).toBe('ADMIN');
    });
  });

  describe('user', () => {
    it('user_whenNoToken_shouldReturnNull', () => {
      expect(service.user()).toBeNull();
    });

    it('user_whenValidToken_shouldReturnSubject', () => {
      const token = createJwt(validClaims);
      service.login({username: 'test', password: 'pass'}).subscribe();
      const req = httpMock.expectOne(ApiEndpoints.Auth.Login);
      req.flush({status: true, data: {token}});
      expect(service.user()).toBe('testuser');
    });
  });

  describe('userId', () => {
    it('userId_whenNoToken_shouldReturnNull', () => {
      expect(service.userId()).toBeNull();
    });

    it('userId_whenValidToken_shouldReturnId', () => {
      const token = createJwt(validClaims);
      service.login({username: 'test', password: 'pass'}).subscribe();
      const req = httpMock.expectOne(ApiEndpoints.Auth.Login);
      req.flush({status: true, data: {token}});
      expect(service.userId()).toBe(42);
    });
  });

  describe('userRole', () => {
    it('userRole_whenNoToken_shouldReturnNull', () => {
      expect(service.userRole()).toBeNull();
    });

    it('userRole_whenValidToken_shouldReturnRole', () => {
      const token = createJwt(validClaims);
      service.login({username: 'test', password: 'pass'}).subscribe();
      const req = httpMock.expectOne(ApiEndpoints.Auth.Login);
      req.flush({status: true, data: {token}});
      expect(service.userRole()).toBe('ADMIN');
    });
  });

  describe('isLoggedIn', () => {
    it('isLoggedIn_whenNoToken_shouldReturnFalse', () => {
      expect(service.isLoggedIn()).toBe(false);
    });

    it('isLoggedIn_whenValidToken_shouldReturnTrue', () => {
      const token = createJwt(validClaims);
      service.login({username: 'test', password: 'pass'}).subscribe();
      const req = httpMock.expectOne(ApiEndpoints.Auth.Login);
      req.flush({status: true, data: {token}});
      expect(service.isLoggedIn()).toBe(true);
    });
  });

  describe('register', () => {
    it('register_whenSuccess_shouldReturnResponse', () => {
      const payload = {
        username: 'test',
        email: 'test@test.com',
        password: 'pass123',
        firstName: 'Test',
        lastName: 'User'
      };
      const mockResponse = {status: true, message: 'Registered', data: {token: 'jwt'}};

      service.register(payload).subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(ApiEndpoints.Auth.Register);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockResponse);
    });

    it('register_whenStatusFalse_shouldThrowError', () => {
      const payload = {
        username: 'test',
        email: 'test@test.com',
        password: 'pass123',
        firstName: 'Test',
        lastName: 'User'
      };

      service.register(payload).subscribe({
        error: (err: unknown) => {
          expect((err as Error).message).toContain('Registration failed');
        },
      });

      const req = httpMock.expectOne(ApiEndpoints.Auth.Register);
      req.flush({status: false, message: null});
    });

    it('register_whenStatusFalseWithMessage_shouldThrowWithMessage', () => {
      const payload = {
        username: 'test',
        email: 'test@test.com',
        password: 'pass123',
        firstName: 'Test',
        lastName: 'User'
      };

      service.register(payload).subscribe({
        error: (err: unknown) => {
          expect((err as Error).message).toBe('Username taken');
        },
      });

      const req = httpMock.expectOne(ApiEndpoints.Auth.Register);
      req.flush({status: false, message: 'Username taken'});
    });
  });

  describe('login', () => {
    it('login_whenSuccess_shouldSetTokenAndReturn', () => {
      const payload = {username: 'test', password: 'pass123'};
      const token = createJwt(validClaims);
      const mockResponse = {status: true, data: {token}};

      service.login(payload).subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(ApiEndpoints.Auth.Login);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);

      expect(service.jwtToken()).toBe(token);
      expect(userServiceMock.refreshUserByUsername).toHaveBeenCalledWith('test');
    });

    it('login_whenStatusFalse_shouldThrowError', () => {
      const payload = {username: 'test', password: 'wrong'};

      service.login(payload).subscribe({
        error: (err: unknown) => {
          expect((err as Error).message).toContain('Login failed');
        },
      });

      const req = httpMock.expectOne(ApiEndpoints.Auth.Login);
      req.flush({status: false});
    });

    it('login_whenNoToken_shouldThrowError', () => {
      const payload = {username: 'test', password: 'pass'};

      service.login(payload).subscribe({
        error: (err: unknown) => {
          expect((err as Error).message).toContain('Login failed');
        },
      });

      const req = httpMock.expectOne(ApiEndpoints.Auth.Login);
      req.flush({status: true, data: {}});
    });
  });

  describe('logout', () => {
    it('logout_whenCalled_shouldClearTokenAndNavigateToLogin', () => {
      localStorage.setItem(LocalStorage.token, 'some-token');
      service.logout();

      expect(service.jwtToken()).toBeNull();
      expect(routerMock.navigate).toHaveBeenCalledWith(['login'], {replaceUrl: true});
      expect(userServiceMock.clearCurrentUser).toHaveBeenCalled();
    });
  });
});
