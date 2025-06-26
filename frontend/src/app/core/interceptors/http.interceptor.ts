import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { catchError, retry, throwError, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { ErrorResponse } from '../models/error-response.model';

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
    catchError((error: HttpErrorResponse) => handleError(error, authService, router))
  );
};


const handleError = (error: HttpErrorResponse, authService: AuthService, router: Router): Observable<never> => {
  let errorMessage = 'An unknown error occurred';

  const errorResponse: ErrorResponse = error.error;

  if (errorResponse) {

    if (errorResponse.message) {
      errorMessage = errorResponse.message;
    }

    if (errorResponse.fieldErrors && Object.keys(errorResponse.fieldErrors).length > 0) {
      const fieldErrors = Object.entries(errorResponse.fieldErrors)
        .map(([field, message]) => `${field}: ${message}`)
        .join(', ');

      errorMessage = `Validation error: ${fieldErrors}`;
    }

    if (errorResponse.details && errorResponse.details.length > 0) {
      errorMessage = `${errorMessage}. Details: ${errorResponse.details.join(', ')}`;
    }
  }

  switch (error.status) {
    case 401:
      if (!error.url?.includes('/auth/authenticate')) {
        authService.logout();
      }
      break;

    case 404:
      router.navigate(['/error/404']);
      break;
  }

  console.error(error);

  return throwError(() => ({
    status: error.status,
    message: errorMessage
  }));
};
