import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  Injector,
  signal
} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {NavigationEnd, Router, RouterModule} from '@angular/router';
import {AuthService} from '../../services/auth/auth.service';
import {filter} from "rxjs/operators";
import {UserService} from "@core/services/user/user.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {ImagePreloadService} from '@core/services/image/image-preload.service';

@Component({
  selector: 'app-header',
  imports: [RouterModule, NgOptimizedImage],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'fixed inset-x-0 top-0 z-50 w-full border-b border-gray-200 bg-white'
  }
})
export class HeaderComponent {
  readonly menuOpen = signal(false);
  private readonly userService = inject(UserService);
  readonly profileImageSrc = computed(() =>
    this.userService.currentUserImageUrl() ?? 'assets/default-avatar.png'
  );
  private readonly imagePreloadService = inject(ImagePreloadService);
  private readonly injector = inject(Injector);
  private readonly imageState = this.imagePreloadService.createPreloadedImage(
    this.profileImageSrc,
    {injector: this.injector},
  );
  readonly displayImageSrc = this.imageState.displaySrc;
  readonly isImageLoading = this.imageState.isLoading;
  private authService = inject(AuthService);
  private router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.menuOpen.set(false)
    });

    const username = this.authService.user();
    if (username) {
      this.fetchUserDetails(username);
    }
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
      .catch((err: unknown) => {
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

  private fetchUserDetails(username: string): void {
    this.userService.getCachedUserByUsername(username)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
