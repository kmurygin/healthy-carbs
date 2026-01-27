import {inject} from '@angular/core';
import type {CanActivateFn} from '@angular/router';
import {Router} from '@angular/router';
import {AuthService} from '../services/auth/auth.service';
import {UserRole} from "@core/models/enum/user-role.enum";

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const claims = authService.claims();

  if (claims?.role === UserRole.ADMIN) {
    return true;
  }

  return router.createUrlTree(['/']);
};
