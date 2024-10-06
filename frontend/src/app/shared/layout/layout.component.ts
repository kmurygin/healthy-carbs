import {Component, effect, inject, OnInit, Injector} from '@angular/core';
import {RouterModule} from "@angular/router";
import {MatDivider} from "@angular/material/divider";
import {MatIcon} from "@angular/material/icon";
import {MatToolbar} from "@angular/material/toolbar";
import {MatButton, MatIconButton} from "@angular/material/button";
import {AuthService} from "../../core/services/auth.service";
import {User} from "../../models/user.model";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, MatDivider, MatIcon, MatToolbar, MatButton, MatIconButton],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit{
  authService = inject(AuthService);
  user?: User;
  isLoggedIn: boolean | undefined;

  ngOnInit(): void {
    this.authService.me().subscribe({
      next: (response) => {
        console.log(response);
        this.user = response.data;
        this.isLoggedIn = this.authService.isLoggedIn();
      }
    })
  }

  logout() {
    this.authService.logout();
  }
}
