import 'zone.js';
import 'zone.js/testing';

import {getTestBed, TestBed} from '@angular/core/testing';
import {beforeEach} from 'vitest';
import {BrowserTestingModule, platformBrowserTesting} from '@angular/platform-browser/testing';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {of} from 'rxjs';
import {DietTypeService} from '@core/services/diet-type/diet-type.service';
import {DietaryProfileService} from '@core/services/dietary-profile/dietary-profile.service';

declare global {
  var __ng_test_env_initialized__: boolean | undefined;
}

const defaultTestProviders = [
  provideHttpClient(),
  provideHttpClientTesting(),
  {
    provide: DietTypeService,
    useValue: {
      getAll: () => of([]),
      create: () => of(null),
      delete: () => of(void 0),
    },
  },
  {
    provide: DietaryProfileService,
    useValue: {
      getProfile: () => of(null),
      save: () => of(null),
    },
  },
];

if (!globalThis.__ng_test_env_initialized__) {
  getTestBed().initTestEnvironment(
    BrowserTestingModule,
    platformBrowserTesting(),
    {teardown: {destroyAfterEach: true}}
  );

  globalThis.__ng_test_env_initialized__ = true;
}

beforeEach(() => {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: defaultTestProviders,
  });
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
