import {defineConfig} from 'vitest/config';
import {playwright} from '@vitest/browser-playwright';
import tsconfigPaths from 'vite-tsconfig-paths';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [tsconfigPaths(), angular()],
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{browser: 'chromium'}]
    },
    globals: true,
    setupFiles: ['src/test.ts'],
    include: ['src/**/*.dom.spec.ts'],
    reporters: ['default', 'junit'],
    outputFile: {
      junit: 'test-results/dom/junit.xml',
    },
  },
});
