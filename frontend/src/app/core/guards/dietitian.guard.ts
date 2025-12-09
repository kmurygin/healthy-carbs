import {inject} from '@angular/core';
import type {CanActivateFn} from '@angular/router';
import {Router} from '@angular/router';
import {AuthService} from '../services/auth/auth.service';

export const dietitianGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const claims = authService.claims();

  if (claims && (claims.role === 'DIETITIAN' || claims.role === 'ADMIN')) {
    return true;
  }

  return router.createUrlTree(['/']);
};
