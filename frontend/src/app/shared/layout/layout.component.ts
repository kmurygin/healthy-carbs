import {Component, inject, OnInit} from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-layout',
    imports: [RouterModule],
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit{
  authService = inject(AuthService); // Inject AuthService

  constructor(private router: Router){}

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

  isActive(route: string): boolean {
    return this.router.url === `/${route}`;
  }
}
