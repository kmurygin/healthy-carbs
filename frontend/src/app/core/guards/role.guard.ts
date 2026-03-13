import {inject} from '@angular/core';
import type {CanActivateFn} from '@angular/router';
import {Router} from '@angular/router';
import {AuthService} from '../services/auth/auth.service';
import {type UserRole} from '@core/models/enum/user-role.enum';

export function createRoleGuard(...allowedRoles: UserRole[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const claims = authService.claims();

    if (claims && allowedRoles.includes(claims.role as UserRole)) {
      return true;
    }

    return router.createUrlTree(['/']);
  };
}

export function createAuthStateGuard(requireAuth: boolean, redirectPath: string): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.isLoggedIn() === requireAuth || router.createUrlTree([redirectPath]);
  };
}
