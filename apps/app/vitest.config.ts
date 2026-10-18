import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { configDefaults, defineConfig } from 'vitest/config';
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: [
      { find: /^@cms\/i18n(\/.*)?$/, replacement: `${resolve(import.meta.dirname, 'src/shared/i18n')}$1` },
      { find: '@', replacement: resolve(import.meta.dirname, 'src') },
    ],
    dedupe: ['react', 'react-dom'],
  },
  plugins: [react()],
  test: {
    environment: 'node',
    exclude: [...configDefaults.exclude, 'tests/browser/**'],
    globals: true,
    setupFiles: ['./src/shared/testing/setup.ts', './tests/mocks/setup.ts'],
    maxWorkers: 1,
    fileParallelism: false,
  },
});
