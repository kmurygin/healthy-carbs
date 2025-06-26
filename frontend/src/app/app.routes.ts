import { Routes } from '@angular/router';
import {DashboardComponent} from "./features/dashboard/dashboard.component";
import {LoginComponent} from "./features/auth/login/login.component";
import {RegisterComponent} from "./features/auth/register/register.component";
import {authGuard} from "./core/guards/auth.guard";
import {guestGuard} from "./core/guards/guest.guard";
import {ErrorComponent} from "./pages/error/error.component";
import {RecipeComponent} from "./features/recipe/recipe.component";
import {UserComponent} from "./features/user/user/user.component";
import {UserDetailComponent} from "./features/user/user-detail/user-detail.component";
import {ChangePasswordComponent} from "./features/user/change-password/change-password.component";
import {MealplanFormComponent} from "./features/mealplan/mealplan-form/mealplan-form.component";
import {IndexComponent} from "./pages/index/index.component";

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'user', redirectTo: 'user/edit_user_details', pathMatch: 'full' },

  { path: 'dashboard', canActivate: [authGuard], component: DashboardComponent },
  { path: 'login', canActivate: [guestGuard], component: LoginComponent },
  { path: 'register', canActivate: [guestGuard], component: RegisterComponent },
  { path: 'recipe', canActivate: [authGuard], component: RecipeComponent },
  { path: 'mealplan-form', canActivate: [authGuard], component: MealplanFormComponent },
  { path: 'index', canActivate: [guestGuard], component: IndexComponent },

  {
    path: 'user',
    canActivate: [authGuard],
    component: UserComponent,
    children: [
      { path: '', redirectTo: 'edit_user_details', pathMatch: 'full' },
      { path: 'edit_user_details', component: UserDetailComponent },
      { path: 'change_password', component: ChangePasswordComponent },
      { path: '**', component: ErrorComponent },
    ]
  },

  { path: '**', component: ErrorComponent }
];

