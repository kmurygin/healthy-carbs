import {ChangeDetectionStrategy, Component, inject, PLATFORM_ID, signal} from '@angular/core';
import {NavigationEnd, Router, RouterModule} from '@angular/router';
import {AuthService} from '../../services/auth/auth.service';
import {filter} from "rxjs/operators";
import {DomSanitizer, type SafeUrl} from "@angular/platform-browser";
import type {UserDto} from "@core/models/dto/user.dto";
import {UserService} from "@core/services/user/user.service";
import {isPlatformBrowser} from "@angular/common";

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
  readonly profileImageSrc = signal<SafeUrl | string>('assets/default-avatar.png');
  private readonly userService = inject(UserService);
  private authService = inject(AuthService);
  private readonly sanitizer = inject(DomSanitizer);
  private router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private currentObjectUrl: string | null = null;

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
    this.userService.getUserByUsername(username).subscribe({
      next: (response) => {
        const data = response.data;
        if (!data) return;

        if (data.profileImageId) {
          this.loadSecureImage(data.profileImageId, data);
        } else {
          this.setFallbackImage(data);
        }
      },
    });
  }

  private loadSecureImage(imageId: number, user: UserDto): void {
    this.userService.getProfileImage(imageId).subscribe({
      next: (blob) => {
        this.revokeCurrentObjectUrl();
        const objectUrl = URL.createObjectURL(blob);
        this.currentObjectUrl = objectUrl;

        this.profileImageSrc.set(this.sanitizer.bypassSecurityTrustUrl(objectUrl));
      },
      error: (error: unknown) => {
        console.error('Failed to load secure image', error);
        this.setFallbackImage(user);
      }
    });
  }

  private revokeCurrentObjectUrl(): void {
    if (this.currentObjectUrl && isPlatformBrowser(this.platformId)) {
      URL.revokeObjectURL(this.currentObjectUrl);
      this.currentObjectUrl = null;
    }
  }

  private setFallbackImage(user: UserDto): void {
    this.revokeCurrentObjectUrl();
    const name = encodeURIComponent(`${user.firstName}+${user.lastName}`);
    this.profileImageSrc.set(`https://ui-avatars.com/api/?name=${name}`);
  }
}
