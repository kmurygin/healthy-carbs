import {TestBed} from '@angular/core/testing';
import {beforeEach, describe, expect, it} from 'vitest';

import {ConfirmationService} from './confirmation.service';

describe('ConfirmationService', () => {
  let service: ConfirmationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfirmationService);
  });

  it('service_whenInjected_shouldBeTruthy', () => {
    expect(service).toBeTruthy();
  });

  it('state_whenInitial_shouldBeClosedWithNullOptions', () => {
    const state = service.state();
    expect(state.isOpen).toBe(false);
    expect(state.options).toBeNull();
  });

  describe('confirm', () => {
    it('confirm_whenCalled_shouldOpenModalAndReturnObservable', () => {
      const obs = service.confirm({title: 'Delete?', message: 'Are you sure?', type: 'danger'});

      expect(obs).toBeDefined();
      const state = service.state();
      expect(state.isOpen).toBe(true);
      expect(state.options?.title).toBe('Delete?');
      expect(state.options?.message).toBe('Are you sure?');
      expect(state.options?.type).toBe('danger');
      expect(state.options?.confirmText).toBe('Confirm');
      expect(state.options?.cancelText).toBe('Cancel');
    });

    it('confirm_whenCalledTwice_shouldCompletePreviousSubject', () => {
      let firstCompleted = false;
      service.confirm({title: 'First', message: 'msg', type: 'info'}).subscribe({
        complete: () => {
          firstCompleted = true;
        },
      });

      service.confirm({title: 'Second', message: 'msg2', type: 'danger'});

      expect(firstCompleted).toBe(true);
      expect(service.state().options?.title).toBe('Second');
    });
  });

  describe('resolve', () => {
    it('resolve_whenTrue_shouldEmitTrueAndClose', () => {
      let result: boolean | undefined;
      service.confirm({title: 'Test', message: 'msg', type: 'info'}).subscribe((r) => {
        result = r;
      });

      service.resolve(true);

      expect(result).toBe(true);
      expect(service.state().isOpen).toBe(false);
      expect(service.state().options).toBeNull();
    });

    it('resolve_whenFalse_shouldEmitFalseAndClose', () => {
      let result: boolean | undefined;
      service.confirm({title: 'Test', message: 'msg', type: 'danger'}).subscribe((r) => {
        result = r;
      });

      service.resolve(false);

      expect(result).toBe(false);
      expect(service.state().isOpen).toBe(false);
    });

    it('resolve_whenNoPending_shouldCloseWithoutError', () => {
      expect(() => {
        service.resolve(true);
      }).not.toThrow();
      expect(service.state().isOpen).toBe(false);
    });
  });
});
