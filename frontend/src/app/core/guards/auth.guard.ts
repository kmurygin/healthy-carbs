import type {CanMatchFn, UrlTree} from '@angular/router';
import {Router} from '@angular/router';
import {AuthService} from "../services/auth/auth.service";
import {inject} from "@angular/core";

export const authGuard: CanMatchFn = (): boolean | UrlTree => {

  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return router.parseUrl('/index');
  }

  return true;
};
