import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/global-config.ts'],
  format: ['esm', 'cjs'],
  platform: 'node',
  clean: true,
  dts: true,
  sourcemap: true,
});
