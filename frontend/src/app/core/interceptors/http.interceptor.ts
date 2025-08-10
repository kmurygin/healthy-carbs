import {HttpErrorResponse, HttpInterceptorFn, HttpStatusCode} from '@angular/common/http';
import {inject} from '@angular/core';
import {catchError, Observable, retry, throwError} from 'rxjs';
import {AuthService} from '../services/auth.service';
import {Router} from '@angular/router';
import {ErrorResponse} from '../models/error-response.model';
import {environment} from '../../../environments/environment';

function isApiCall(url: string): boolean {
  const requestUrl = new URL(url, window.location.origin);
  const apiUrl = new URL(environment.apiUrl, window.location.origin);
  return requestUrl.origin === apiUrl.origin && requestUrl.pathname.startsWith(apiUrl.pathname);
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
        Authorization: `Bearer ${authService.getUserToken()}`
      }
    });
  }

  return next(req).pipe(
    retry(2),
    catchError((error: HttpErrorResponse) =>
      handleError(error, authService, router)
    )
  );
};

const handleError = (
  error: HttpErrorResponse,
  authService: AuthService,
  router: Router
): Observable<never> => {
  const errorResponse: ErrorResponse = error.error;
  let errorMessage = 'An unknown error occurred';

  if (errorResponse) {
    errorMessage = errorResponse.message || errorMessage;

    if (errorResponse.fieldErrors && Object.keys(errorResponse.fieldErrors).length > 0) {
      const fields = Object.entries(errorResponse.fieldErrors)
        .map(([field, msg]) => `${field}: ${msg}`)
        .join(', ');
      errorMessage += ` | Field errors: ${fields}`;
    }

    if (errorResponse.details?.length) {
      errorMessage += ` | Details: ${errorResponse.details.join(', ')}`;
    }

    if (errorResponse.traceId) {
      console.warn(`[HTTP ERROR] Error traceId: ${errorResponse.traceId}`);
    }
  }

  switch (error.status) {
    case HttpStatusCode.Unauthorized:
      if (!error.url?.includes('/auth/authenticate')) {
        authService.logout();
      }
      break;

    case HttpStatusCode.Forbidden:
      errorMessage ||= 'You do not have permission to perform this action.';
      break;

    case HttpStatusCode.NotFound:
      router.navigate(['/error/404']);
      break;

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
