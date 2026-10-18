import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build } from 'bun';

// Preserve the pinned localization runtime verbatim. Prebundling its 2,500+
// generated message modules avoids retaining thousands of duplicate module
// graphs in both TanStack Start build environments. No locale is removed.
const source = resolve(import.meta.dirname, '../src/shared/i18n');
const output = resolve(import.meta.dirname, '../.cache/i18n');
const digest = createHash('sha256');
for (const entry of (await readdir(source, { recursive: true, withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
  if (!entry.isFile() || !/\.(ts|js)$/.test(entry.name) || entry.name.endsWith('.test.ts')) continue;
  digest.update(entry.name).update(await readFile(resolve(entry.parentPath, entry.name)));
}
for (const name of (await readdir(resolve(import.meta.dirname, '../i18n/messages'))).sort())
  digest.update(name).update(await readFile(resolve(import.meta.dirname, '../i18n/messages', name)));
const fingerprint = digest.digest('hex');
try {
  if ((await readFile(resolve(output, 'fingerprint'), 'utf8')) === fingerprint) process.exit(0);
} catch {
  /* first build */
}
await mkdir(output, { recursive: true });
const result = await build({
  entrypoints: ['index', 'react', 'site', 'standalone'].map((name) => resolve(source, `${name}.ts`)),
  outdir: output,
  target: 'browser',
  format: 'esm',
  splitting: true,
  minify: true,
  external: ['react', 'react/jsx-runtime'],
  naming: '[name].js',
});
if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}
await writeFile(resolve(output, 'fingerprint'), fingerprint);
console.log('Prebundled app localization (all supported languages).');
