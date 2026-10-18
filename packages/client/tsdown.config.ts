import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'react/index': 'src/react/index.ts',
  },
  format: ['esm'],
  platform: 'neutral',
  dts: true,
  sourcemap: true,
  clean: true,
  deps: {
    neverBundle: ['react', '@tanstack/react-query'],
  },
});
