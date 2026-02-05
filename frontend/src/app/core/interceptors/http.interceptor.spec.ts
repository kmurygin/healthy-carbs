import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {HttpClient, HttpStatusCode, provideHttpClient, withInterceptors} from '@angular/common/http';
import {Router} from '@angular/router';
import {signal} from '@angular/core';
import type {MockedObject} from 'vitest';
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
    vi.useFakeTimers();

    authServiceMock = {
      isLoggedIn: signal(true),
      isTokenExpired: vi.fn().mockReturnValue(false),
      jwtToken: signal('test-jwt-token'),
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
    vi.useRealTimers();
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

  it('httpInterceptor_whenNotLoggedIn_shouldNotAttachAuthorizationHeader', () => {
    authServiceMock.isLoggedIn = signal(false);

    httpClient.get(`${apiUrl}/test`).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/test`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('httpInterceptor_whenTokenExpired_shouldLogoutAndThrowError', () => {
    authServiceMock.isTokenExpired = vi.fn().mockReturnValue(true) as typeof authServiceMock.isTokenExpired;

    httpClient.get(`${apiUrl}/test`).subscribe({
      error: (err: unknown) => {
        expect((err as Error).message).toContain('Session expired');
      },
    });

    expect(authServiceMock.logout).toHaveBeenCalled();
  });

  it('httpInterceptor_whenUnauthorizedError_shouldLogout', () => {
    httpClient.get(`${apiUrl}/test`).subscribe({
      error: () => { /* expected */
      },
    });

    const req = httpMock.expectOne(`${apiUrl}/test`);
    req.flush(
      {message: 'Unauthorized'},
      {status: HttpStatusCode.Unauthorized, statusText: 'Unauthorized'}
    );

    // retry(2) means 3 total attempts
    for (let i = 0; i < 2; i++) {
      vi.advanceTimersByTime(500);
      const retryReq = httpMock.expectOne(`${apiUrl}/test`);
      retryReq.flush(
        {message: 'Unauthorized'},
        {status: HttpStatusCode.Unauthorized, statusText: 'Unauthorized'}
      );
    }

    expect(authServiceMock.logout).toHaveBeenCalled();
  });

  it('httpInterceptor_whenUnauthorizedOnAuthEndpoint_shouldNotLogout', () => {
    const loginUrl = `${apiUrl}/auth/authenticate`;
    authServiceMock.logout = vi.fn() as typeof authServiceMock.logout;

    httpClient.post(loginUrl, {}).subscribe({
      error: () => { /* expected */
      },
    });

    // POST requests are not retried
    const req = httpMock.expectOne(loginUrl);
    req.flush(
      {message: 'Bad credentials'},
      {status: HttpStatusCode.Unauthorized, statusText: 'Unauthorized'}
    );

    expect(authServiceMock.logout).not.toHaveBeenCalled();
  });

  it('httpInterceptor_whenForbiddenError_shouldReturnForbiddenMessage', () => {
    httpClient.get(`${apiUrl}/test`).subscribe({
      error: (err: unknown) => {
        expect((err as Error).message).toContain('permission');
      },
    });

    const req = httpMock.expectOne(`${apiUrl}/test`);
    req.flush(
      {message: ''},
      {status: HttpStatusCode.Forbidden, statusText: 'Forbidden'}
    );

    for (let i = 0; i < 2; i++) {
      vi.advanceTimersByTime(500);
      const retryReq = httpMock.expectOne(`${apiUrl}/test`);
      retryReq.flush(
        {message: ''},
        {status: HttpStatusCode.Forbidden, statusText: 'Forbidden'}
      );
    }
  });

  it('httpInterceptor_whenNotFoundError_shouldNavigateToError404', () => {
    httpClient.get(`${apiUrl}/test`).subscribe({
      error: () => { /* expected */
      },
    });

    const req = httpMock.expectOne(`${apiUrl}/test`);
    req.flush(
      {message: 'Not found'},
      {status: HttpStatusCode.NotFound, statusText: 'Not Found'}
    );

    for (let i = 0; i < 2; i++) {
      vi.advanceTimersByTime(500);
      const retryReq = httpMock.expectOne(`${apiUrl}/test`);
      retryReq.flush(
        {message: 'Not found'},
        {status: HttpStatusCode.NotFound, statusText: 'Not Found'}
      );
    }

    expect(routerMock.navigate).toHaveBeenCalledWith(['/error/404']);
  });

  it('httpInterceptor_whenFieldErrors_shouldFormatErrorMessage', () => {
    httpClient.get(`${apiUrl}/test`).subscribe({
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

    for (let i = 0; i < 2; i++) {
      vi.advanceTimersByTime(500);
      const retryReq = httpMock.expectOne(`${apiUrl}/test`);
      retryReq.flush(
        {message: 'Validation failed', fieldErrors: {email: 'Invalid email'}},
        {status: HttpStatusCode.BadRequest, statusText: 'Bad Request'}
      );
    }
  });

  it('httpInterceptor_whenErrorWithDetails_shouldAppendDetails', () => {
    httpClient.get(`${apiUrl}/test`).subscribe({
      error: (err: unknown) => {
        expect((err as Error).message).toContain('Detail A');
      },
    });

    const req = httpMock.expectOne(`${apiUrl}/test`);
    req.flush(
      {message: 'Error occurred', details: ['Detail A']},
      {status: HttpStatusCode.BadRequest, statusText: 'Bad Request'}
    );

    for (let i = 0; i < 2; i++) {
      vi.advanceTimersByTime(500);
      const retryReq = httpMock.expectOne(`${apiUrl}/test`);
      retryReq.flush(
        {message: 'Error occurred', details: ['Detail A']},
        {status: HttpStatusCode.BadRequest, statusText: 'Bad Request'}
      );
    }
  });

  it('httpInterceptor_whenInternalServerError_shouldReturnServerErrorMessage', () => {
    httpClient.get(`${apiUrl}/test`).subscribe({
      error: (err: unknown) => {
        expect((err as Error).message).toContain('server error');
      },
    });

    const req = httpMock.expectOne(`${apiUrl}/test`);
    req.flush(
      {message: ''},
      {status: HttpStatusCode.InternalServerError, statusText: 'Internal Server Error'}
    );

    for (let i = 0; i < 2; i++) {
      vi.advanceTimersByTime(500);
      const retryReq = httpMock.expectOne(`${apiUrl}/test`);
      retryReq.flush(
        {message: ''},
        {status: HttpStatusCode.InternalServerError, statusText: 'Internal Server Error'}
      );
    }
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
