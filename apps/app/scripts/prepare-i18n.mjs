import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Validate the pinned flat-string message format without a build-time database,
// remote compiler plugins, or generated files in the saved source tree.
const directory = resolve(import.meta.dirname, '../i18n/messages');
const english = JSON.parse(await readFile(resolve(directory, 'en.json'), 'utf8'));
for (const name of await readdir(directory)) {
  if (!name.endsWith('.json')) continue;
  const catalog = JSON.parse(await readFile(resolve(directory, name), 'utf8'));
  for (const [key, value] of Object.entries(english)) {
    if (typeof value !== 'string' || typeof catalog[key] !== 'string') throw new Error(`Unsupported or missing app message ${name}:${key}`);
  }
}
