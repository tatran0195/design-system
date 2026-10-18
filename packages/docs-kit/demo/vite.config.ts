import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  root: import.meta.dirname,
  resolve: {
    alias: { '@': resolve(import.meta.dirname, '../src') },
    dedupe: ['react', 'react-dom'],
  },
  plugins: [react()],
  server: { host: '127.0.0.1', port: 4175, strictPort: true },
});
