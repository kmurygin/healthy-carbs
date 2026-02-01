import {TestBed} from '@angular/core/testing';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {ConfettiService} from './confetti.service';

vi.mock('canvas-confetti', () => ({
  default: vi.fn().mockReturnValue(Promise.resolve()),
}));

describe('ConfettiService', () => {
  let service: ConfettiService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfettiService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('service_whenInjected_shouldBeTruthy', () => {
    expect(service).toBeTruthy();
  });

  it('triggerConfetti_whenCalled_shouldNotThrow', () => {
    expect(() => {
      service.triggerConfetti();
    }).not.toThrow();
  });
});
