import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

// This package is `"type": "module"`, so the CommonJS output of
// `tsconfig.cjs.json` needs its own `package.json` to be treated as CJS by
// Node and bundlers.
const cjsDir = path.join(process.cwd(), 'dist', 'cjs');

await mkdir(cjsDir, { recursive: true });
await writeFile(path.join(cjsDir, 'package.json'), `${JSON.stringify({ type: 'commonjs' }, undefined, 2)}\n`);
