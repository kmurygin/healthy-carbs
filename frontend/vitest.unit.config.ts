import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [tsconfigPaths(), angular()],
  test: {
    environment: 'jsdom',
    browser: { enabled: false },
    globals: true,
    setupFiles: ['src/test.ts'],
    include: ['src/**/*.spec.ts'],
    exclude: ['src/**/*.dom.spec.ts'],
    reporters: ['default', 'junit'],
    outputFile: {
      junit: 'test-results/unit/junit.xml',
    },
  },
});
