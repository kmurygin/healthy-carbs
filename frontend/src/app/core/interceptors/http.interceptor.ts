import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { catchError, retry, throwError } from 'rxjs';
import { Router } from '@angular/router';

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
      },
    });
  }

  return next(req).pipe(
    retry(2),
    catchError((e: HttpErrorResponse) => {
      let errorMessage = 'An unknown error occurred';

      switch (e.status) {
        case 400:
          errorMessage = 'Bad Request. Please check your input.';
          break;

        case 401:
          errorMessage = 'Unauthorized. Redirecting to login.';
          authService.logout();
          break;

        case 403:
          errorMessage = 'Access denied.';
          break;

        case 404:
          errorMessage = 'Resource not found.';
          router.navigate(['/error/404']);
          break;

        case 500:
          errorMessage = 'Internal server error.';
          break;

        case 503:
          errorMessage = 'Service unavailable.';
          break;

        default:
          errorMessage = e.error.message || e.statusText || errorMessage;
          break;
      }

      console.error(`Error Status: ${e.status}, Message: ${errorMessage}`);
      return throwError(() => errorMessage);
    })
  );
};
