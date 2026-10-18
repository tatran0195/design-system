import { createHash } from 'node:crypto';
import { access, readdir, readFile, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

const app = resolve(import.meta.dirname, '..');
const root = resolve(app, '../..');
const manifestPath = resolve(app, 'upstream-manifest.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const excluded = new Set(['node_modules', '.cache', '.output', '.nitro', 'dist', 'coverage', 'test-results', 'playwright-report']);
async function* files(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      if (!excluded.has(entry.name)) yield* files(path);
    } else yield path;
  }
}
const problems = [];
const refresh = process.argv.includes('--refresh');
for (const entry of manifest.files) {
  try {
    const bytes = await readFile(resolve(app, entry.target));
    const hash = sha(bytes);
    if (refresh) {
      entry.targetSha256 = hash;
      entry.disposition = 'adapted-or-retained';
    } else if (entry.targetSha256 && entry.targetSha256 !== hash) problems.push(`Provenance hash changed: ${entry.target}`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    if (refresh) {
      entry.disposition = 'excluded-or-consolidated';
      delete entry.targetSha256;
    } else if (entry.disposition !== 'excluded-or-consolidated') problems.push(`Unrecorded missing source: ${entry.target}`);
  }
}
if (!refresh) {
  for (const entry of manifest.authoredFiles ?? []) {
    try {
      if (sha(await readFile(resolve(app, entry.path))) !== entry.sha256) problems.push(`Authored-file provenance hash changed: ${entry.path}`);
    } catch {
      problems.push(`Authored provenance file missing: ${entry.path}`);
    }
  }
}
const tracked = new Set(manifest.files.map((entry) => entry.target));
const authored = [];
for await (const path of files(app)) {
  const name = relative(app, path).replaceAll('\\', '/');
  if (name === 'upstream-manifest.json') continue;
  if (refresh && !tracked.has(name)) authored.push({ path: name, sha256: sha(await readFile(path)) });
  if (!/\.(?:[cm]?[jt]sx?|json)$/.test(name) || name.startsWith('i18n/messages/')) continue;
  const source = await readFile(path, 'utf8');
  if (name.startsWith('src/')) {
    const imports = [...source.matchAll(/(?:from\s*|import\s*\(|require\s*\(|vi\.mock\s*\()\s*['"]([^'"]+)/g)].map((match) => match[1]);
    for (const specifier of imports) {
      if (/^(?:@nibleaf\/|@radix-ui\/|radix-ui(?:\/|$)|cmdk(?:\/|$)|@tanstack\/react-form(?:\/|$))/.test(specifier))
        problems.push(`Retired workspace/primitive/form import: ${name}: ${specifier}`);
      if (/^@base-ui\/react\/(?:internals|utils|.*\/.*\/)/.test(specifier)) problems.push(`Non-public Base UI import: ${name}: ${specifier}`);
      if (/scripts\/design-fixtures/.test(specifier)) problems.push(`Fixtures imported into runtime: ${name}`);
    }
    if (/<PlanSection\b|<UsageTab\b/.test(source)) problems.push(`Excluded commercial surface: ${name}`);
  }
  if (/^src\/routes\/(?:\([^/]+\)\/)?(?:pricing|cloud|about|contact|developers|guides|blog|compare|alternatives)(?:[./$])/.test(name))
    problems.push(`Excluded public marketing route: ${name}`);
}
const pkg = JSON.parse(await readFile(resolve(app, 'package.json'), 'utf8'));
if (pkg.license !== 'AGPL-3.0-only') problems.push('Application license must remain AGPL-3.0-only');
await access(resolve(app, 'licenses/nibleaf-AGPL-3.0.txt'));
if (!/to:\s*['"]\/app['"]/.test(await readFile(resolve(app, 'src/routes/index.tsx'), 'utf8'))) problems.push('Root must redirect to /app');
if (process.argv.includes('--check-studio')) {
  const baseline = JSON.parse(await readFile(resolve(app, 'provenance/studio-baseline.json'), 'utf8'));
  for (const [name, hash] of Object.entries(baseline)) {
    try {
      if (sha(await readFile(resolve(root, name))) !== hash) problems.push(`Studio changed since port baseline: ${name}`);
    } catch {
      problems.push(`Studio baseline file missing: ${name}`);
    }
  }
}
if (refresh) {
  manifest.authoredFiles = authored.sort((a, b) => a.path.localeCompare(b.path));
  manifest.adaptation =
    'Primary CMS/public Base UI, RHF/Zod, app-local upstream locales, typed frontend-only Nibleaf contracts; no billing/marketing implementation or CMS backend integration.';
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}
if (problems.length) {
  for (const problem of problems) console.error(problem);
  process.exit(1);
}
console.log(
  `App port audit passed: ${manifest.files.length} upstream records; AGPL, runtime boundaries and excluded routes checked${process.argv.includes('--check-studio') ? '; Studio baseline unchanged' : ''}.`,
);
