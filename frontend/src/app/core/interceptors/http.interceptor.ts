import type {HttpEvent} from '@angular/common/http';
import {
  HttpErrorResponse,
  type HttpHandlerFn,
  type HttpInterceptorFn,
  type HttpRequest,
  HttpStatusCode
} from '@angular/common/http';
import {inject, isDevMode} from '@angular/core';
import type {Observable} from 'rxjs';
import {catchError, filter, from, retry, switchMap, take, throwError, timer} from 'rxjs';
import {AuthService} from '../services/auth/auth.service';
import {Router} from '@angular/router';
import type {ErrorResponse} from '../models/error-response.model';
import {environment} from '../../../environments/environment';

const AUTH_URLS_SKIP_REFRESH = ['/auth/authenticate', '/auth/refresh', '/auth/register'];

function isApiCall(url: string): boolean {
  const requestUrl = new URL(url, window.location.origin);
  const apiUrl = new URL(environment.apiUrl, window.location.origin);
  return requestUrl.origin === apiUrl.origin && requestUrl.pathname.startsWith(apiUrl.pathname);
}

function toHttpStatusCode(n: number) {
  return HttpStatusCode[n] ? (n as HttpStatusCode) : null;
}

function shouldSkipRefresh(url: string): boolean {
  return AUTH_URLS_SKIP_REFRESH.some(path => url.includes(path));
}

export const httpInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.jwtToken();
  const isTokenAttach = isApiCall(req.url) && token != null;

  if (isDevMode()) {
    console.debug(`[HTTP] ${req.method} ${req.url}`, isTokenAttach ? '(authenticated)' : '(anonymous)');
  }

  if (isTokenAttach) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  const response$ = next(req);

  const safeResponse$ = req.method === 'GET'
    ? response$.pipe(retry({
      count: 2, delay: (error, retryCount) => {
        if (error instanceof HttpErrorResponse && error.status > 0 && error.status < 500) {
          return throwError(() => error);
        }
        if (isDevMode()) {
          console.warn(`[HTTP] Retry ${retryCount}/2 for GET ${req.url}`, error);
        }
        return timer(500);
      }
    }))
    : response$;

  return safeResponse$.pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const isUnauthorized = toHttpStatusCode(error.status) === HttpStatusCode.Unauthorized;
        if (isUnauthorized && shouldSkipRefresh(req.url)) {
          const errorResponse = error.error as { message?: string } | null;
          return throwError(() => new Error(errorResponse?.message ?? 'Authentication failed'));
        }
        if (isUnauthorized) {
          return handleUnauthorized(req, next, authService);
        }
        return handleError(error, authService, router);
      }
      return throwError(() => error instanceof Error ? error : new Error('An unknown error occurred'));
    })
  );
};

const handleUnauthorized = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
): Observable<HttpEvent<unknown>> => {
  if (!authService.refreshTokenValue()) {
    if (isDevMode()) {
      console.warn('[Auth Refresh] No refresh token available, logging out');
    }
    authService.logout();
    return throwError(() => new Error('Session expired. Please log in again.'));
  }

  if (!authService.isRefreshing) {
    authService.isRefreshing = true;
    authService.refreshTokenSubject.next(null);
    if (isDevMode()) {
      console.debug('[Auth Refresh] Starting token refresh');
    }

    return authService.refreshAccessToken().pipe(
      switchMap(res => {
        authService.isRefreshing = false;
        const newToken = res.data?.token;
        if (isDevMode()) {
          if (newToken) {
            console.debug('[Auth Refresh] Token refresh successful, retrying original request');
          } else {
            console.warn('[Auth Refresh] Refresh response missing token');
          }
        }
        authService.refreshTokenSubject.next(newToken ?? null);

        return next(req.clone({
          setHeaders: {Authorization: `Bearer ${newToken}`}
        }));
      }),
      catchError((err: unknown) => {
        authService.isRefreshing = false;
        if (isDevMode()) {
          const errorDetail = err instanceof HttpErrorResponse ? `${err.status}` : 'unknown';
          console.error('[Auth Refresh] Token refresh failed, logging out. Status:', errorDetail);
        }
        authService.refreshTokenSubject.next(null);
        authService.logout();
        return throwError(() => err);
      })
    );
  }

  if (isDevMode()) {
    console.debug('[Auth Refresh] Refresh already in progress, queuing request');
  }
  return authService.refreshTokenSubject.pipe(
    filter(token => token != null),
    take(1),
    switchMap(token => {
      if (isDevMode()) {
        console.debug('[Auth Refresh] Queued request retrying with new token');
      }
      return next(req.clone({
        setHeaders: {Authorization: `Bearer ${token}`}
      }));
    })
  );
};

const handleError = (
  error: HttpErrorResponse,
  authService: AuthService,
  router: Router
): Observable<never> => {
  const errorResponse = error.error as ErrorResponse | null;
  let errorMessage = 'An unknown error occurred';

  errorMessage = errorResponse?.message ?? errorMessage;

  if (errorResponse?.fieldErrors && Object.keys(errorResponse.fieldErrors).length > 0) {
    errorMessage = '';
    const fields = Object.entries(errorResponse.fieldErrors)
      .map(([field, msg]) => `${field}: \n ${msg}`)
      .join('\n');
    errorMessage += fields;
  }

  if (errorResponse?.details?.length) {
    errorMessage += ` | Details: ${errorResponse.details.join(', ')}`;
  }

  if (isDevMode()) {
    console.group(`[HTTP ERROR] ${error.status} — ${error.url}`);
    if (errorResponse?.traceId) {
      console.warn('Trace ID:', errorResponse.traceId);
    }
    if (errorResponse?.fieldErrors) {
      console.warn('Field errors:', errorResponse.fieldErrors);
    }
    if (errorResponse?.details?.length) {
      console.warn('Details:', errorResponse.details);
    }
  }

  switch (toHttpStatusCode(error.status)) {
    case HttpStatusCode.Forbidden:
      errorMessage ||= 'You do not have permission to perform this action.';
      break;

    case HttpStatusCode.NotFound:
      return from(router.navigate(['/error/404'])).pipe(
        switchMap(() => throwError(() => new Error(errorMessage)))
      );

    case HttpStatusCode.InternalServerError:
      errorMessage ||= 'A server error occurred. Please try again later.';
      break;

    default:
      break;
  }

  if (isDevMode()) {
    console.groupEnd();
  }

  return throwError(() => new Error(errorMessage));
};
