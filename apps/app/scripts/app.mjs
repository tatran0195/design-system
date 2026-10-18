import { fileURLToPath } from 'node:url';
import './prepare-shared.mjs';
import { execFileSync } from 'node:child_process';

execFileSync('node', [fileURLToPath(new URL('./prepare-i18n.mjs', import.meta.url))], { stdio: 'inherit' });
for (const script of ['prebundle-i18n.ts', 'prebundle-vendor.ts'])
  execFileSync('bun', [fileURLToPath(new URL(script, import.meta.url))], { stdio: 'inherit' });

import { createBuilder, createServer } from 'vite';

const mode = process.argv.find((arg) => arg.startsWith('--mode='))?.slice(7) ?? 'production';
if (process.argv.includes('--build')) {
  const builder = await createBuilder({ mode });
  await builder.buildApp();
} else {
  const server = await createServer();
  await server.listen();
  server.printUrls();
}
