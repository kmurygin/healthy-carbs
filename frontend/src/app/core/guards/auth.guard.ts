import {CanMatchFn, Router, UrlTree} from '@angular/router';
import {AuthService} from "../services/auth.service";
import {inject} from "@angular/core";

export const authGuard: CanMatchFn = (route, segments): boolean | UrlTree => {

  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return router.parseUrl('/index');
  }

  return true;
};
