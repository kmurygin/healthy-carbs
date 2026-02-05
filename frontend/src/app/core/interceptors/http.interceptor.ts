import {HttpErrorResponse, type HttpInterceptorFn, HttpStatusCode} from '@angular/common/http';
import {inject} from '@angular/core';
import type {Observable} from 'rxjs';
import {catchError, from, retry, switchMap, throwError, timer} from 'rxjs';
import {AuthService} from '../services/auth/auth.service';
import {Router} from '@angular/router';
import type {ErrorResponse} from '../models/error-response.model';
import {environment} from '../../../environments/environment';

function isApiCall(url: string): boolean {
  const requestUrl = new URL(url, window.location.origin);
  const apiUrl = new URL(environment.apiUrl, window.location.origin);
  return requestUrl.origin === apiUrl.origin && requestUrl.pathname.startsWith(apiUrl.pathname);
}

function toHttpStatusCode(n: number) {
  return HttpStatusCode[n] ? (n as HttpStatusCode) : null;
}

export const httpInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const isTokenAttach = isApiCall(req.url) && authService.isLoggedIn();

  if (isTokenAttach) {
    if (authService.isTokenExpired()) {
      authService.logout();
      return throwError(() => new Error('Session expired. Please log in again.'));
    }

    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authService.jwtToken()}`
      }
    });
  }

  const response$ = next(req);

  const safeResponse$ = req.method === 'GET'
    ? response$.pipe(retry({count: 2, delay: () => timer(500)}))
    : response$;

  return safeResponse$.pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        return handleError(error, authService, router);
      }
      return throwError(() => error instanceof Error ? error : new Error('An unknown error occurred'));
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

  if (errorResponse?.traceId) {
    console.warn(`[HTTP ERROR] Error traceId: ${errorResponse.traceId}`);
  }

  switch (toHttpStatusCode(error.status)) {
    case HttpStatusCode.Unauthorized:
      if (!error.url?.includes('/auth/authenticate')) {
        authService.logout();
      }
      break;

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

  console.log('[HTTP ERROR] errorMessage: ', errorMessage);
  console.error('[HTTP ERROR]', error);

  return throwError(() => new Error(errorMessage));
};
