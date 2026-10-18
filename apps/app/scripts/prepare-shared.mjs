import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

for (const name of ['ui', 'editor']) {
  const directory = resolve(import.meta.dirname, '../../../packages', name);
  if (!existsSync(resolve(directory, 'dist/index.mjs'))) execFileSync('bun', ['run', '--cwd', directory, 'build'], { stdio: 'inherit' });
}

const dashboard = resolve(import.meta.dirname, '../../../packages/dashboard');
if (!existsSync(resolve(dashboard, 'dist/index.js'))) execFileSync('bun', ['run', '--cwd', dashboard, 'build'], { stdio: 'inherit' });
