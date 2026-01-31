import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  Injector,
  signal,
  untracked,
  viewChild
} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {NavigationEnd, Router, RouterModule} from '@angular/router';
import {AuthService} from '../../services/auth/auth.service';
import {filter} from "rxjs/operators";
import {UserService} from "@core/services/user/user.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {ImagePreloadService} from '@core/services/image/image-preload.service';
import {UserRole} from '@core/models/enum/user-role.enum';
import {MobileMenuComponent} from './mobile-menu/mobile-menu.component';
import {NAV_ITEMS} from '@core/constants/nav-items';
import {DEFAULT_AVATAR_PATH} from '@core/constants/constants';
import {NotificationService} from '@core/services/ui/notification.service';

@Component({
  selector: 'app-header',
  imports: [RouterModule, NgOptimizedImage, MobileMenuComponent],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'fixed inset-x-0 top-0 z-50 w-full border-b border-gray-200 bg-white'
  }
})
export class HeaderComponent {
  readonly menuOpen = signal(false);
  readonly navItems = NAV_ITEMS;
  readonly isAdminOrDietitian = computed(() => {
    const role = this.userRole();
    return role === UserRole.ADMIN || role === UserRole.DIETITIAN;
  });
  protected readonly UserRole = UserRole;
  private readonly mobileMenu = viewChild<MobileMenuComponent>('mobileMenu');
  private readonly userService = inject(UserService);
  readonly profileImageSrc = computed(() =>
    this.userService.currentUserImageUrl() ?? DEFAULT_AVATAR_PATH
  );
  private readonly authService = inject(AuthService);
  readonly username = this.authService.user;
  readonly isLoggedIn = computed(() => this.authService.isLoggedIn());
  readonly userRole = computed(() => this.authService.userRole() as UserRole | null);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notificationService = inject(NotificationService);
  private readonly imagePreloadService = inject(ImagePreloadService);
  private readonly injector = inject(Injector);
  private readonly imageState = this.imagePreloadService.createPreloadedImage(
    this.profileImageSrc,
    {injector: this.injector},
  );
  readonly displayImageSrc = this.imageState.displaySrc;
  readonly isImageLoading = this.imageState.isLoading;

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.mobileMenu()?.close();
        this.menuOpen.set(false);
      });

    effect(() => {
      const username = this.username();
      if (username) {
        untracked(() => {
          this.fetchUserDetails(username);
        });
      }
    });
  }

  async logout(): Promise<void> {
    this.authService.logout();
    try {
      await this.router.navigate(['/login']);
      this.notificationService.success('You have been logged out successfully');
    } catch (err: unknown) {
      console.error('Navigation failed', err);
      this.notificationService.error('Logout completed, but navigation failed. Please refresh the page.');
    }
  }

  openMenu(): void {
    this.mobileMenu()?.open();
    this.menuOpen.set(true);
  }

  onMenuClosed(): void {
    this.menuOpen.set(false);
  }

  private fetchUserDetails(username: string): void {
    this.userService.refreshUserByUsername(username)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          if (!user) {
            console.warn('User details not found for:', username);
          }
        },
        error: (err: unknown) => {
          console.error('Failed to fetch user details', err);
        }
      });
  }
}
