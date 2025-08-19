import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get username(): string | null {
    return this.authService.getUserFromToken();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login'])
      .catch(err => {
        console.error('Navigation failed', err);
      });
  }
}
