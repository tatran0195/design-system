import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': resolve(import.meta.dirname, './src'),
      // Subpath before the bare specifier — vite aliases prefix-match.
      '@cms/i18n/react': resolve(import.meta.dirname, '../i18n/src/react.ts'),
      '@cms/i18n': resolve(import.meta.dirname, '../i18n/src/index.ts'),
      '@cms/icons': resolve(import.meta.dirname, '../icons/src/index.ts'),
      // @cms/ui intentionally resolves to its built dist (exports map) — the
      // package's internal `@/…` aliases do not apply outside its own project.
    },
  },
  plugins: [react()],
  test: {
    server: {
      deps: {
        inline: ['react', 'react-dom'],
      },
    },
    environment: 'jsdom',
    setupFiles: [resolve(import.meta.dirname, './setup-test.ts')],
  },
});
