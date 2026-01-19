import type {Routes} from '@angular/router';
import {guestGuard} from '@core/guards/guest.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    canMatch: [guestGuard],
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canMatch: [guestGuard],
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    canMatch: [guestGuard],
    loadComponent: () => import('./password-recovery/password-recovery.component').then(m => m.PasswordRecoveryComponent)
  },
  {
    path: 'verify-otp',
    canMatch: [guestGuard],
    loadComponent: () => import('./verify-otp/verify-otp.component').then(m => m.VerifyOtpComponent)
  },
  {
    path: 'reset-password',
    canMatch: [guestGuard],
    loadComponent: () => import('./reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  }
];
