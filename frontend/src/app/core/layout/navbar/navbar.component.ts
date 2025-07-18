import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import {Component, OnInit, inject, ViewEncapsulation, ChangeDetectionStrategy} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {MatDivider} from "@angular/material/divider";

@Component({
  selector: 'app-navbar',
  imports: [
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDivider
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);

  isLoggedIn = false;
  username = null;

  ngOnInit(): void {
    const user = this.authService.getUserFromToken();
    this.isLoggedIn = !!user;
    this.username = user?.username || null;
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }

  isActive(route: string): boolean {
    return this.router.url === `/${route}`;
  }
}
