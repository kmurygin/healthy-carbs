import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {NavigationEnd, Router, RouterModule} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {filter} from "rxjs/operators";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  readonly menuOpen = signal(false);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => this.menuOpen.set(false));
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get username(): string | null {
    return this.authService.user();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login'])
      .catch(err => {
        console.error('Navigation failed', err);
      });
  }

  openMenu(dlg: HTMLDialogElement): void {
    if (!dlg.open) dlg.showModal();
    this.menuOpen.set(true);
  }

  closeMenu(dlg: HTMLDialogElement): void {
    if (dlg.open) dlg.close();
    this.menuOpen.set(false);
  }
}
