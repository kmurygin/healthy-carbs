import {Routes} from '@angular/router';
import {authGuard} from './core/guards/auth.guard';
import {guestGuard} from './core/guards/guest.guard';

export const routes: Routes = [
  {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
  {path: 'user', redirectTo: 'user/edit_user_details', pathMatch: 'full'},

  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'recipe',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/recipe/recipe.component').then(
        (m) => m.RecipeComponent
      ),
  },
  {
    path: 'mealplan-form',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/mealplan/mealplan-form/mealplan-form.component').then(
        (m) => m.MealplanFormComponent
      ),
  },
  {
    path: 'index',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/index/index.component').then((m) => m.IndexComponent),
  },
  {
    path: 'user',
    canActivate: [authGuard],
    loadChildren: () => import('./features/user/user.routes'),
  },

  {
    path: '**',
    loadComponent: () =>
      import('./pages/error/error.component').then((m) => m.ErrorComponent),
  },
];
