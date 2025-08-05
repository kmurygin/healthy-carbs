import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {catchError, Observable, retry, throwError} from 'rxjs';
import {AuthService} from '../services/auth.service';
import {Router} from '@angular/router';
import {ErrorResponse} from '../models/error-response.model';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
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
    if (errorResponse.fieldErrors && Object.keys(errorResponse.fieldErrors).length > 0) {
      const fieldErrors = Object.entries(errorResponse.fieldErrors)
        .map(([field, msg]) => `${field}: ${msg}`)
        .join(', ');
      errorMessage = `Validation error: ${fieldErrors}`;
    } else if (errorResponse.message) {
      errorMessage = errorResponse.message;
    }

    if (errorResponse.details?.length) {
      errorMessage += `. Details: ${errorResponse.details.join(', ')}`;
    }
  }

  switch (error.status) {
    case 401:
      if (!error.url?.includes('/auth/authenticate')) {
        authService.logout();
      }
      break;

    case 403:
      errorMessage = 'You do not have permission to perform this action.';
      break;

    case 404:
      router.navigate(['/error/404']);
      break;

    case 500:
      errorMessage = 'Server error. Please try again later.';
      break;
  }

  console.error('[HTTP ERROR]', error);

  return throwError(() => new Error(errorMessage));
};
