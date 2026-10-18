import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: { index: 'src/index.ts', tokens: 'src/tokens/index.ts' },
  format: ['esm'],
  platform: 'browser',
  clean: true,
  dts: true,
  sourcemap: true,
  fixedExtension: true,
  suppressWarnings: [/module level directive "use client"/i],
});
