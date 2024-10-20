import {Component, inject, OnInit} from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButton, MatIconButton } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, MatDivider, MatIcon, MatToolbar, MatButton, MatIconButton],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit{
  authService = inject(AuthService); // Inject AuthService
  isLoggedIn: boolean = false;
  username: string | null = null;

  ngOnInit() {
    const user = this.authService.getUserFromToken();

    if (user) {
      this.isLoggedIn = true;
      this.username = user.username;
    } else {
      this.isLoggedIn = false;
      this.username = null;
    }
  }

  logout() {
    this.isLoggedIn = false;
    this.authService.logout();
  }
}
