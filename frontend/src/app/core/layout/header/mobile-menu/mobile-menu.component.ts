import {ChangeDetectionStrategy, Component, inject, input, type OnDestroy, output, signal} from '@angular/core';
import {RouterModule} from '@angular/router';
import {DOCUMENT, NgOptimizedImage} from '@angular/common';
import {A11yModule} from '@angular/cdk/a11y';
import {UserRole} from '@core/models/enum/user-role.enum';
import {type NavItem} from '@core/constants/nav-items';

const ANIMATION_DURATION_MS = 150;

@Component({
  selector: 'app-mobile-menu',
  imports: [RouterModule, NgOptimizedImage, A11yModule],
  templateUrl: './mobile-menu.component.html',
  styleUrl: './mobile-menu.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscapeKey()'
  }
})
export class MobileMenuComponent implements OnDestroy {
  readonly isOpen = signal(false);
  readonly isClosing = signal(false);
  readonly navItems = input.required<readonly NavItem[]>();
  readonly isLoggedIn = input.required<boolean>();
  readonly username = input.required<string | null>();
  readonly userRole = input.required<UserRole | null>();
  readonly isAdminOrDietitian = input.required<boolean>();
  readonly displayImageSrc = input.required<string>();
  readonly isImageLoading = input.required<boolean>();
  readonly logoutRequested = output();
  readonly menuClosed = output();
  protected readonly UserRole = UserRole;
  private readonly document = inject(DOCUMENT);
  private previouslyFocusedElement: HTMLElement | null = null;
  private closeTimeoutId: ReturnType<typeof setTimeout> | null = null;

  open(): void {
    if (this.isOpen()) return;

    if (this.closeTimeoutId) {
      clearTimeout(this.closeTimeoutId);
      this.closeTimeoutId = null;
    }

    this.previouslyFocusedElement = this.document.activeElement as HTMLElement;
    this.isClosing.set(false);
    this.isOpen.set(true);
  }

  close(): void {
    if (!this.isOpen() || this.isClosing()) return;

    this.isClosing.set(true);
    this.menuClosed.emit();

    this.previouslyFocusedElement?.focus();
    this.previouslyFocusedElement = null;

    this.closeTimeoutId = setTimeout(() => {
      this.isOpen.set(false);
      this.isClosing.set(false);
      this.closeTimeoutId = null;
    }, ANIMATION_DURATION_MS);
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  onEscapeKey(): void {
    if (this.isOpen()) {
      this.close();
    }
  }

  onLogout(): void {
    this.close();
    this.logoutRequested.emit();
  }

  ngOnDestroy(): void {
    if (this.closeTimeoutId) {
      clearTimeout(this.closeTimeoutId);
    }
  }
}
