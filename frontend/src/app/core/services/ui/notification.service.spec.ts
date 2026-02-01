import {TestBed} from '@angular/core/testing';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {NotificationService} from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('service_whenInjected_shouldBeTruthy', () => {
    expect(service).toBeTruthy();
  });

  it('toasts_whenInitial_shouldBeEmpty', () => {
    expect(service.toasts()).toEqual([]);
  });

  describe('success', () => {
    it('success_whenCalled_shouldAddSuccessToast', () => {
      service.success('Operation complete');

      const toasts = service.toasts();
      expect(toasts).toHaveLength(1);
      expect(toasts[0].message).toBe('Operation complete');
      expect(toasts[0].type).toBe('success');
      expect(toasts[0].duration).toBe(3000);
    });

    it('success_whenDurationElapsed_shouldAutoRemoveToast', () => {
      service.success('Temporary', 1000);
      expect(service.toasts()).toHaveLength(1);

      vi.advanceTimersByTime(1000);
      expect(service.toasts()).toHaveLength(0);
    });
  });

  describe('error', () => {
    it('error_whenCalled_shouldAddErrorToast', () => {
      service.error('Something failed');

      const toasts = service.toasts();
      expect(toasts).toHaveLength(1);
      expect(toasts[0].message).toBe('Something failed');
      expect(toasts[0].type).toBe('error');
      expect(toasts[0].duration).toBe(5000);
    });
  });

  describe('info', () => {
    it('info_whenCalled_shouldAddInfoToast', () => {
      service.info('FYI');

      const toasts = service.toasts();
      expect(toasts).toHaveLength(1);
      expect(toasts[0].message).toBe('FYI');
      expect(toasts[0].type).toBe('info');
      expect(toasts[0].duration).toBe(3000);
    });
  });

  describe('remove', () => {
    it('remove_whenValidId_shouldRemoveToast', () => {
      service.success('First');
      service.error('Second');
      expect(service.toasts()).toHaveLength(2);

      const idToRemove = service.toasts()[0].id;
      service.remove(idToRemove);

      expect(service.toasts()).toHaveLength(1);
      expect(service.toasts()[0].message).toBe('Second');
    });

    it('remove_whenInvalidId_shouldNotRemoveAnything', () => {
      service.success('Only one');
      service.remove(999);

      expect(service.toasts()).toHaveLength(1);
    });
  });

  it('multipleToasts_whenAdded_shouldStackInOrder', () => {
    service.success('A');
    service.error('B');
    service.info('C');

    const toasts = service.toasts();
    expect(toasts).toHaveLength(3);
    expect(toasts[0].message).toBe('A');
    expect(toasts[1].message).toBe('B');
    expect(toasts[2].message).toBe('C');
  });
});
