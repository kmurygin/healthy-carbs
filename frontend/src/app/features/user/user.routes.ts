import type {Routes} from '@angular/router';
import {UserComponent} from './user/user.component';

export const USER_ROUTES: Routes = [
  {
    path: '',
    component: UserComponent,
    children: [
      {path: '', redirectTo: 'edit_user_details', pathMatch: 'full'},

      {
        path: 'edit_user_details',
        loadComponent: () =>
          import('./user-detail/user-detail.component')
            .then(c => c.UserDetailComponent)
      },

      {
        path: 'change_password',
        loadComponent: () =>
          import('./change-password/change-password.component')
            .then(c => c.ChangePasswordComponent)
      },

      {
        path: '**',
        loadComponent: () =>
          import('../../pages/error/error.component')
            .then(c => c.ErrorComponent)
      }

    ]
  }
];
