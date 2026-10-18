// MSW is loaded only into the explicitly marked design artifact's Node process.
import { execFileSync, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const base = resolve(import.meta.dirname, '..');
const env = {
  ...process.env,
  CMS_DESIGN_PREVIEW: 'true',
  CMS_MSW_PREVIEW: 'true',
  GOMAXPROCS: process.env.GOMAXPROCS ?? '2',
  RAYON_NUM_THREADS: process.env.RAYON_NUM_THREADS ?? '2',
  TOKIO_WORKER_THREADS: process.env.TOKIO_WORKER_THREADS ?? '2',
  MALLOC_ARENA_MAX: process.env.MALLOC_ARENA_MAX ?? '2',
  NODE_OPTIONS: process.env.NODE_OPTIONS ?? '--max-old-space-size=768',
};
execFileSync('node', ['scripts/app.mjs', '--build', '--mode=design'], { cwd: base, stdio: 'inherit', env });
const entry = resolve(base, '.cache/design-output/server/index.mjs');
if (!existsSync(entry)) throw new Error('Design artifact missing; refusing to load MSW into a different server.');
const child = spawn('node', ['--import', new URL('./mocks/bootstrap.mjs', import.meta.url).href, relative(base, entry)], {
  cwd: base,
  stdio: 'inherit',
  env: { ...env, PORT: '4310', NITRO_PORT: '4310', HOST: '0.0.0.0', NITRO_HOST: '0.0.0.0' },
});
child.once('exit', (code) => process.exit(code ?? 0));
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => child.kill(signal));
