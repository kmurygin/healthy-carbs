import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {vi} from 'vitest';

import {MobileMenuComponent} from './mobile-menu.component';
import {NAV_ITEMS} from '@core/constants/nav-items';

const ANIMATION_DURATION_MS = 150;

describe('MobileMenuComponent', () => {
  let component: MobileMenuComponent;
  let fixture: ComponentFixture<MobileMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileMenuComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(MobileMenuComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('navItems', NAV_ITEMS);
    fixture.componentRef.setInput('isLoggedIn', false);
    fixture.componentRef.setInput('username', null);
    fixture.componentRef.setInput('userRole', null);
    fixture.componentRef.setInput('isAdminOrDietitian', false);
    fixture.componentRef.setInput('displayImageSrc', '/assets/images/default-avatar.png');
    fixture.componentRef.setInput('isImageLoading', false);

    fixture.detectChanges();
  });

  it('create_DefaultState_ComponentCreated', () => {
    expect(component).toBeTruthy();
  });

  describe('open', () => {
    it('open_MenuClosed_SetsIsOpenTrue', () => {
      component.open();
      expect(component.isOpen()).toBe(true);
    });

    it('open_MenuClosed_SetsIsClosingFalse', () => {
      component.open();
      expect(component.isClosing()).toBe(false);
    });

    it('open_MenuAlreadyOpen_StateRemainsOpen', () => {
      component.open();
      const openState = component.isOpen();
      component.open();
      expect(component.isOpen()).toBe(openState);
    });
  });

  describe('close', () => {
    it('close_MenuOpen_SetsIsClosingTrue', () => {
      component.open();
      component.close();
      expect(component.isClosing()).toBe(true);
    });

    it('close_MenuOpen_EmitsMenuClosedEvent', () => {
      const emitSpy = vi.spyOn(component.menuClosed, 'emit');
      component.open();
      component.close();
      expect(emitSpy).toHaveBeenCalled();
    });

    it('close_MenuOpen_SetsIsOpenFalseAfterAnimation', () => {
      vi.useFakeTimers();

      component.open();
      component.close();
      expect(component.isOpen()).toBe(true);

      vi.advanceTimersByTime(ANIMATION_DURATION_MS);

      expect(component.isOpen()).toBe(false);
      vi.useRealTimers();
    });

    it('close_MenuOpen_SetsIsClosingFalseAfterAnimation', () => {
      vi.useFakeTimers();

      component.open();
      component.close();

      vi.advanceTimersByTime(ANIMATION_DURATION_MS);

      expect(component.isClosing()).toBe(false);
      vi.useRealTimers();
    });

    it('close_MenuClosed_DoesNothing', () => {
      const emitSpy = vi.spyOn(component.menuClosed, 'emit');
      component.close();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('close_MenuAlreadyClosing_DoesNothing', () => {
      component.open();
      component.close();
      const emitSpy = vi.spyOn(component.menuClosed, 'emit');
      component.close();
      expect(emitSpy).not.toHaveBeenCalled();
    });
  });

  describe('onBackdropClick', () => {
    it('onBackdropClick_ClickOnBackdrop_ClosesMenu', () => {
      component.open();
      const target = {};
      const mockEvent = {target, currentTarget: target} as unknown as MouseEvent;
      component.onBackdropClick(mockEvent);
      expect(component.isClosing()).toBe(true);
    });

    it('onBackdropClick_ClickInsidePanel_DoesNotCloseMenu', () => {
      component.open();
      const mockEvent = {target: {}, currentTarget: {}} as unknown as MouseEvent;
      component.onBackdropClick(mockEvent);
      expect(component.isClosing()).toBe(false);
    });
  });

  describe('onEscapeKey', () => {
    it('onEscapeKey_MenuOpen_ClosesMenu', () => {
      component.open();
      component.onEscapeKey();
      expect(component.isClosing()).toBe(true);
    });

    it('onEscapeKey_MenuClosed_DoesNothing', () => {
      const emitSpy = vi.spyOn(component.menuClosed, 'emit');
      component.onEscapeKey();
      expect(emitSpy).not.toHaveBeenCalled();
    });
  });

  describe('onLogout', () => {
    it('onLogout_UserLoggedIn_EmitsLogoutRequested', () => {
      const emitSpy = vi.spyOn(component.logoutRequested, 'emit');
      component.open();
      component.onLogout();
      expect(emitSpy).toHaveBeenCalled();
    });

    it('onLogout_UserLoggedIn_ClosesMenu', () => {
      component.open();
      component.onLogout();
      expect(component.isClosing()).toBe(true);
    });
  });

  describe('ngOnDestroy', () => {
    it('ngOnDestroy_MenuClosing_ClearsTimeout', () => {
      vi.useFakeTimers();

      component.open();
      component.close();
      component.ngOnDestroy();

      vi.advanceTimersByTime(ANIMATION_DURATION_MS);
      expect(component.isOpen()).toBe(true);
      vi.useRealTimers();
    });
  });
});
