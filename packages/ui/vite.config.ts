import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
// Imported from `vitest/config`, not `vite`: Vitest 4 no longer augments Vite's
// `UserConfig` with a `test` property, so `/// <reference types="vitest" />` plus
// Vite's own `defineConfig` no longer typechecks.
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    setupFiles: './setup-test.ts',
    coverage: {
      reporter: ['lcov', 'text'],
      include: ['src/**'],
      exclude: ['**/*.stories.tsx', '**/index.ts'], // exclude stories and index files
    },
    globals: true,
    environment: 'jsdom',
    css: false,
  },
});
