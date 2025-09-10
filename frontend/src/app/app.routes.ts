import type {Routes} from '@angular/router';
import {authGuard} from './core/guards/auth.guard';
import {guestGuard} from './core/guards/guest.guard';

export const routes: Routes = [
  {path: '', redirectTo: 'dashboard', pathMatch: 'full'},

  {
    path: 'dashboard',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
  {
    path: 'login',
    canMatch: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'register',
    canMatch: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'recipe',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./features/recipe/recipe.component').then(
        (m) => m.RecipeComponent
      ),
  },
  {
    path: 'mealplan-form',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./features/mealplan/mealplan-form/mealplan-form.component').then(
        (m) => m.MealplanFormComponent
      ),
  },
  {
    path: 'index',
    canMatch: [guestGuard],
    loadComponent: () =>
      import('./pages/index/index.component').then((m) => m.IndexComponent),
  },
  {
    path: 'offers',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./features/payments/offers/offers.component').then((m) => m.OffersComponent),
  },
  {
    path: 'user',
    canMatch: [authGuard],
    loadChildren: () => import('./features/user/user.routes')
      .then(m => m.USER_ROUTES)
  },
  {
    path: 'payments',
    canMatch: [authGuard],
    loadChildren: () =>
      import('./features/payments/payments.routes').then(
        (m) => m.PAYMENT_ROUTES
      ),
  },
  {
    path: 'error/404',
    loadComponent: () =>
      import('./pages/error/error.component').then((m) => m.ErrorComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/error/error.component').then((m) => m.ErrorComponent),
  },
];
