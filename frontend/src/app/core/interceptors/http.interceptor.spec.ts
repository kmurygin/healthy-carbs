import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {HttpClient, HttpStatusCode, provideHttpClient, withInterceptors} from '@angular/common/http';
import {Router} from '@angular/router';
import {signal} from '@angular/core';
import type {MockedObject} from 'vitest';
import {BehaviorSubject} from 'rxjs';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {httpInterceptor} from './http.interceptor';
import {AuthService} from '../services/auth/auth.service';
import {environment} from '../../../environments/environment';

describe('httpInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceMock: MockedObject<Partial<AuthService>>;
  let routerMock: MockedObject<Partial<Router>>;

  const apiUrl = environment.apiUrl;

  beforeEach(() => {
    authServiceMock = {
      isLoggedIn: signal(true),
      isTokenExpired: vi.fn().mockReturnValue(false),
      jwtToken: signal('test-jwt-token'),
      refreshTokenValue: signal(null),
      isRefreshing: false,
      refreshTokenSubject: new BehaviorSubject<string | null>(null),
      logout: vi.fn(),
    } as unknown as MockedObject<Partial<AuthService>>;

    routerMock = {
      navigate: vi.fn().mockResolvedValue(true),
    } as unknown as MockedObject<Partial<Router>>;

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([httpInterceptor])),
        provideHttpClientTesting(),
        {provide: AuthService, useValue: authServiceMock},
        {provide: Router, useValue: routerMock},
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('httpInterceptor_whenApiCallAndLoggedIn_shouldAttachAuthorizationHeader', () => {
    httpClient.get(`${apiUrl}/test`).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/test`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-jwt-token');
    req.flush({});
  });

  it('httpInterceptor_whenNonApiCall_shouldNotAttachAuthorizationHeader', () => {
    httpClient.get('https://external-api.com/data').subscribe();

    const req = httpMock.expectOne('https://external-api.com/data');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('httpInterceptor_whenNoToken_shouldNotAttachAuthorizationHeader', () => {
    authServiceMock.jwtToken = signal(null) as typeof authServiceMock.jwtToken;

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([httpInterceptor])),
        provideHttpClientTesting(),
        {provide: AuthService, useValue: authServiceMock},
        {provide: Router, useValue: routerMock},
      ],
    });
    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);

    httpClient.get(`${apiUrl}/test`).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/test`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('httpInterceptor_whenUnauthorizedAndNoRefreshToken_shouldLogout', () => {
    httpClient.get(`${apiUrl}/test`).subscribe({
      error: () => { /* expected */ },
    });

    const req = httpMock.expectOne(`${apiUrl}/test`);
    req.flush(
      {message: 'Unauthorized'},
      {status: HttpStatusCode.Unauthorized, statusText: 'Unauthorized'}
    );

    expect(authServiceMock.logout).toHaveBeenCalled();
  });

  it('httpInterceptor_whenUnauthorizedOnAuthEndpoint_shouldNotLogout', () => {
    const loginUrl = `${apiUrl}/auth/authenticate`;
    authServiceMock.logout = vi.fn() as typeof authServiceMock.logout;

    httpClient.post(loginUrl, {}).subscribe({
      error: () => { /* expected */ },
    });

    const req = httpMock.expectOne(loginUrl);
    req.flush(
      {message: 'Bad credentials'},
      {status: HttpStatusCode.Unauthorized, statusText: 'Unauthorized'}
    );

    expect(authServiceMock.logout).not.toHaveBeenCalled();
  });

  it('httpInterceptor_whenForbiddenError_shouldReturnForbiddenMessage', () => {
    httpClient.post(`${apiUrl}/test`, {}).subscribe({
      error: (err: unknown) => {
        expect((err as Error).message).toContain('permission');
      },
    });

    const req = httpMock.expectOne(`${apiUrl}/test`);
    req.flush(
      {message: ''},
      {status: HttpStatusCode.Forbidden, statusText: 'Forbidden'}
    );
  });

  it('httpInterceptor_whenNotFoundError_shouldNavigateToError404', () => {
    httpClient.post(`${apiUrl}/test`, {}).subscribe({
      error: () => { /* expected */ },
    });

    const req = httpMock.expectOne(`${apiUrl}/test`);
    req.flush(
      {message: 'Not found'},
      {status: HttpStatusCode.NotFound, statusText: 'Not Found'}
    );

    expect(routerMock.navigate).toHaveBeenCalledWith(['/error/404']);
  });

  it('httpInterceptor_whenFieldErrors_shouldFormatErrorMessage', () => {
    httpClient.post(`${apiUrl}/test`, {}).subscribe({
      error: (err: unknown) => {
        expect((err as Error).message).toContain('email');
        expect((err as Error).message).toContain('Invalid email');
      },
    });

    const req = httpMock.expectOne(`${apiUrl}/test`);
    req.flush(
      {message: 'Validation failed', fieldErrors: {email: 'Invalid email'}},
      {status: HttpStatusCode.BadRequest, statusText: 'Bad Request'}
    );
  });

  it('httpInterceptor_whenErrorWithDetails_shouldAppendDetails', () => {
    httpClient.post(`${apiUrl}/test`, {}).subscribe({
      error: (err: unknown) => {
        expect((err as Error).message).toContain('Detail A');
      },
    });

    const req = httpMock.expectOne(`${apiUrl}/test`);
    req.flush(
      {message: 'Error occurred', details: ['Detail A']},
      {status: HttpStatusCode.BadRequest, statusText: 'Bad Request'}
    );
  });

  it('httpInterceptor_whenInternalServerError_shouldReturnServerErrorMessage', () => {
    httpClient.post(`${apiUrl}/test`, {}).subscribe({
      error: (err: unknown) => {
        expect((err as Error).message).toContain('server error');
      },
    });

    const req = httpMock.expectOne(`${apiUrl}/test`);
    req.flush(
      {message: ''},
      {status: HttpStatusCode.InternalServerError, statusText: 'Internal Server Error'}
    );
  });

  it('httpInterceptor_whenSuccessfulRequest_shouldPassThrough', () => {
    const mockData = {result: 'ok'};
    httpClient.get(`${apiUrl}/test`).subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${apiUrl}/test`);
    req.flush(mockData);
  });
});
