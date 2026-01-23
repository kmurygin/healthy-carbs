import {defineConfig} from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    angular()
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test.ts'],
    include: ['src/**/*.spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
    reporters: ['default', 'junit'],
    outputFile: {
      junit: 'test-results/unit/junit.xml',
    },
    coverage: {
      provider: 'v8',
      enabled: true,
      reporter: ['text', 'html'],
      reportsDirectory: 'coverage/unit',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.spec.ts',
        'src/test.ts',
        'src/main.ts',
        'src/app/app.config.ts',
        '**/*.d.ts'
      ]
    },
  },
});
