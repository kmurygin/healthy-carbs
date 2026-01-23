import 'zone.js';
import 'zone.js/testing';

import {getTestBed, TestBed} from '@angular/core/testing';
import {BrowserTestingModule, platformBrowserTesting,} from '@angular/platform-browser/testing';

declare global {
  var __ng_test_env_initialized__: boolean | undefined;
}

if (!globalThis.__ng_test_env_initialized__) {
  getTestBed().initTestEnvironment(
    BrowserTestingModule,
    platformBrowserTesting(),
  );

  globalThis.__ng_test_env_initialized__ = true;
}

afterEach(() => {
  TestBed.resetTestingModule();
});

if (!('matchMedia' in window)) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}
