import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';
import {provideRouter, Router} from '@angular/router';
import {signal} from '@angular/core';
import {vi} from 'vitest';

import {HeaderComponent} from './header.component';
import {AuthService} from '@core/services/auth/auth.service';
import {UserService} from '@core/services/user/user.service';
import {NotificationService} from '@core/services/ui/notification.service';
import {UserRole} from '@core/models/enum/user-role.enum';
import {of} from 'rxjs';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let router: Router;

  const mockUser = signal<string | null>(null);
  const mockIsLoggedIn = signal(false);
  const mockUserRole = signal<UserRole | null>(null);
  const mockUserImageUrl = signal<string | null>(null);

  const authServiceMock = {
    user: mockUser,
    isLoggedIn: mockIsLoggedIn,
    userRole: mockUserRole,
    logout: vi.fn()
  };

  const userServiceMock = {
    currentUserImageUrl: mockUserImageUrl,
    refreshUserByUsername: vi.fn().mockReturnValue(of(null))
  };

  const notificationServiceMock = {
    success: vi.fn(),
    error: vi.fn()
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideRouter([{path: 'login', component: HeaderComponent}]),
        {provide: AuthService, useValue: authServiceMock},
        {provide: UserService, useValue: userServiceMock},
        {provide: NotificationService, useValue: notificationServiceMock}
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    mockUser.set(null);
    mockIsLoggedIn.set(false);
    mockUserRole.set(null);
    mockUserImageUrl.set(null);
  });

  it('create_DefaultState_ComponentCreated', () => {
    expect(component).toBeTruthy();
  });

  describe('menuOpen signal', () => {
    it('menuOpen_InitialState_ReturnsFalse', () => {
      expect(component.menuOpen()).toBe(false);
    });

    it('openMenu_MenuClosed_SetsMenuOpenTrue', () => {
      component.openMenu();
      expect(component.menuOpen()).toBe(true);
    });

    it('onMenuClosed_MenuOpen_SetsMenuOpenFalse', () => {
      component.openMenu();
      component.onMenuClosed();
      expect(component.menuOpen()).toBe(false);
    });
  });

  describe('logout', () => {
    it('logout_UserLoggedIn_CallsAuthServiceLogout', async () => {
      await component.logout();
      expect(authServiceMock.logout).toHaveBeenCalled();
    });

    it('logout_UserLoggedIn_NavigatesToLogin', async () => {
      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      await component.logout();
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });

    it('logout_UserLoggedIn_ShowsSuccessNotification', async () => {
      vi.spyOn(router, 'navigate').mockResolvedValue(true);
      await component.logout();
      expect(notificationServiceMock.success).toHaveBeenCalledWith(
        'You have been logged out successfully'
      );
    });

    it('logout_NavigationFails_ShowsErrorNotification', async () => {
      vi.spyOn(router, 'navigate').mockRejectedValue(new Error('Navigation failed'));
      await component.logout();
      expect(notificationServiceMock.error).toHaveBeenCalledWith(
        'Logout completed, but navigation failed. Please refresh the page.'
      );
    });
  });

  describe('computed signals', () => {
    it('isLoggedIn_UserNotLoggedIn_ReturnsFalse', () => {
      mockIsLoggedIn.set(false);
      expect(component.isLoggedIn()).toBe(false);
    });

    it('isLoggedIn_UserLoggedIn_ReturnsTrue', () => {
      mockIsLoggedIn.set(true);
      expect(component.isLoggedIn()).toBe(true);
    });

    it('isAdminOrDietitian_RoleUser_ReturnsFalse', () => {
      mockUserRole.set(UserRole.USER);
      expect(component.isAdminOrDietitian()).toBe(false);
    });

    it('isAdminOrDietitian_RoleAdmin_ReturnsTrue', () => {
      mockUserRole.set(UserRole.ADMIN);
      expect(component.isAdminOrDietitian()).toBe(true);
    });

    it('isAdminOrDietitian_RoleDietitian_ReturnsTrue', () => {
      mockUserRole.set(UserRole.DIETITIAN);
      expect(component.isAdminOrDietitian()).toBe(true);
    });
  });
});
