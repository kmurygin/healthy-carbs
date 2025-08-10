import {CanMatchFn, Router, UrlTree} from '@angular/router';
import {inject} from "@angular/core";
import {AuthService} from "../services/auth.service";

export const guestGuard: CanMatchFn = (route, segments): boolean | UrlTree => {

  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return router.parseUrl('');
  }

  return true;
};
