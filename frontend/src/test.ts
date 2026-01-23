import 'zone.js';
import 'zone.js/testing';

import {getTestBed} from '@angular/core/testing';
import {BrowserTestingModule, platformBrowserTesting,} from '@angular/platform-browser/testing';

declare global {
  // eslint-disable-next-line no-var
  var __ng_test_env_initialized__: boolean | undefined;
}

if (!globalThis.__ng_test_env_initialized__) {
  getTestBed().initTestEnvironment(
    BrowserTestingModule,
    platformBrowserTesting(),
  );

  globalThis.__ng_test_env_initialized__ = true;
}

if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {
      },
      removeListener: () => {
      },
      addEventListener: () => {
      },
      removeEventListener: () => {
      },
      dispatchEvent: () => false,
    }),
  });
}
