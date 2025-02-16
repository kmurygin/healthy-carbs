import { Routes } from '@angular/router';
import {LayoutComponent} from "./shared/layout/layout.component";
import {DashboardComponent} from "./pages/dashboard/dashboard.component";
import {LoginComponent} from "./pages/login/login.component";
import {RegisterComponent} from "./pages/register/register.component";
import {authGuard} from "./core/guards/auth.guard";
import {guestGuard} from "./core/guards/guest.guard";
import {ErrorComponent} from "./pages/error/error.component";
import {RecipeComponent} from "./pages/recipe/recipe.component";
import {UserComponent} from "./pages/user/user.component";
import {UserDetailComponent} from "./components/userdetail/user-detail.component";
import {ChangepasswordComponent} from "./components/changepassword/changepassword.component";

export const routes: Routes = [
  { path: '', component: LayoutComponent,
    children: [
      { path: '', redirectTo: "dashboard", pathMatch: 'full' },
      { path: 'user', redirectTo: "user/edit_user_details", pathMatch: 'full' },
      { path: 'dashboard',
        canActivate: [authGuard],
        component: DashboardComponent },
      { path: 'login', canActivate: [guestGuard], component: LoginComponent },
      { path: 'register', canActivate: [guestGuard], component: RegisterComponent },
      { path: 'recipe', canActivate: [authGuard], component: RecipeComponent },
      { path: 'user', canActivate: [authGuard], component: UserComponent,
        children: [
          { path: 'edit_user_details', component: UserDetailComponent, canActivate: [authGuard] },
          { path: 'change_password', component: ChangepasswordComponent, canActivate: [authGuard] },
          { path: '**', component: ErrorComponent },
          ]},
      { path: '**', component: ErrorComponent },
    ]}
];
