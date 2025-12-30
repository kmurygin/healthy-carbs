import type {Routes} from '@angular/router';
import {authGuard} from '@core/guards/auth.guard';
import {guestGuard} from '@core/guards/guest.guard';
import {dietitianGuard} from "@core/guards/dietitian.guard";

export const routes: Routes = [
  {path: '', redirectTo: 'dashboard', pathMatch: 'full'},

  {
    path: 'dashboard',
    canMatch: [authGuard],
    loadComponent: () =>
      import('@features/dashboard/dashboard/dashboard.component').then(
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
    path: 'recipes/:id',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./features/recipes-list/recipe/recipe.component').then(
        (m) => m.RecipeComponent
      ),
  },
  {
    path: 'dietary-profile-form',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./features/mealplan/dietary-profile-form/dietary-profile-form.component').then(
        (m) => m.DietaryProfileFormComponent
      ),
  },
  {
    path: 'mealplan',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./features/mealplan/mealplan/mealplan.component').then(
        (m) => m.MealPlanComponent
      ),
  },
  {
    path: 'mealplan/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/mealplan/mealplan/mealplan.component').then(
        (m) => m.MealPlanComponent,
      ),
  },
  {
    path: 'mealplan-history',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./features/mealplan/mealplan-history/mealplan-history.component').then(
        (m) => m.MealPlanHistoryComponent
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
    path: 'recipes',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./features/recipes-list/recipe-list/recipe-list.component').then((m) => m.RecipeListComponent),
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
    path: 'dietitian',
    canActivate: [dietitianGuard],
    loadChildren: () => import('./features/dietitian/dietitian.routes')
      .then(m => m.DIETITIAN_ROUTES)
  },
  {
    path: 'user-measurements',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./features/measurement/user-measurements/user-measurements.component').then((m) => m.UserMeasurementsComponent),
  },
  {
    path: 'dietitians',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./features/collaboration/dietitian-list/dietitian-list.component').then((m) => m.DietitianListComponent),
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
