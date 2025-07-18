import { Routes } from '@angular/router';

export default [
  { path: '', redirectTo: 'edit_user_details', pathMatch: 'full' },
  {
    path: 'edit_user_details',
    loadComponent: () =>
      import('./user-detail/user-detail.component').then(
        (m) => m.UserDetailComponent
      ),
  },
  {
    path: 'change_password',
    loadComponent: () =>
      import(
        './change-password/change-password.component'
      ).then((m) => m.ChangePasswordComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('../../pages/error/error.component').then((m) => m.ErrorComponent),
  },
] satisfies Routes;

