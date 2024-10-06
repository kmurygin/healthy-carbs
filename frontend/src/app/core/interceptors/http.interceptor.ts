import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {AuthService} from "../services/auth.service";
import {inject} from "@angular/core";
import {catchError, retry, throwError} from "rxjs";
import {LocalStorage} from "../constants/constants";
import {Router} from "@angular/router";

export const httpInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const router  = inject(Router);

  if(authService.isLoggedIn()) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authService.getUserToken()}`
      },
    });
  }

  return next(req).pipe(
    retry(2),  // Retry the request twice before failing
    catchError((e: HttpErrorResponse) => {

      let errorMessage = 'An unknown error occurred';  // Default error message

      switch (e.status) {
        case 400:
          errorMessage = 'Bad Request. Please check your input.';
          break;

        case 401:
          errorMessage = 'Unauthorized. Redirecting to login.';
          localStorage.removeItem(LocalStorage.token);
          router.navigate(['']);
          break;

        case 403:
          errorMessage = 'Access denied. Endpoint.';
          break;

        case 404:
          errorMessage = 'Resource not found. Please check the URL or try again later.';
          router.navigate(['']); //TODO navigate to error page
          break;

        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;

        case 503:
          errorMessage = 'Service unavailable. Please check your connection or try again later.';
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
