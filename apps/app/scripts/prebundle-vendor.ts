import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build } from 'bun';

const base = resolve(import.meta.dirname, '..');
const output = resolve(base, '.cache/vendor');
const fingerprint = createHash('sha256')
  .update(await readFile(resolve(base, '../../bun.lock')))
  .update('vendor-v1')
  .digest('hex');
try {
  if ((await readFile(resolve(output, 'fingerprint'), 'utf8')) === fingerprint) process.exit(0);
} catch {
  /* first build */
}
await mkdir(output, { recursive: true });
const result = await build({
  entrypoints: [resolve(import.meta.dirname, 'vendor/mermaid.ts'), resolve(import.meta.dirname, 'vendor/scalar.ts')],
  outdir: output,
  target: 'browser',
  format: 'esm',
  splitting: true,
  minify: true,
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  naming: '[name].js',
});
if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}
await writeFile(resolve(output, 'fingerprint'), fingerprint);
console.log('Prebundled the unchanged Mermaid and Scalar browser libraries.');
