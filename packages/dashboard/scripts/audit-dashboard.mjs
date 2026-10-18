#!/usr/bin/env bun
import { execFileSync } from 'node:child_process';
/** Deterministic provenance, dependency and documentation-entry isolation checks. */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const { Bun } = globalThis;
if (typeof Bun === 'undefined') throw new Error('Run this audit with Bun (bun run audit:dashboard).');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dashboard = resolve(root, 'src');
const manifest = JSON.parse(readFileSync(resolve(dashboard, 'upstream-manifest.json'), 'utf8'));
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const sourceFlag = process.argv.indexOf('--source');
const upstream = sourceFlag < 0 ? null : resolve(process.argv[sourceFlag + 1]);
const errors = [];
const hash = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');
const files = (path) =>
  readdirSync(path, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? files(resolve(path, entry.name)) : [resolve(path, entry.name)],
  );
const production = files(dashboard).filter((path) => /\.(ts|tsx)$/.test(path) && !/(__tests__|\.(spec|test)\.)/.test(path));
const scanners = {
  '.ts': new Bun.Transpiler({ loader: 'ts' }),
  '.tsx': new Bun.Transpiler({ loader: 'tsx', tsconfig: { compilerOptions: { jsx: 'react' } } }),
};
const imports = (path) => scanners[extname(path)]?.scanImports(readFileSync(path, 'utf8')) ?? [];
const dependency = (path) => (path.startsWith('@') ? path.split('/').slice(0, 2).join('/') : path.split('/')[0]);
const dependencies = new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {})]);
const resolveModule = (path, name) => {
  const base = name.startsWith('@/') ? resolve(root, 'src', name.slice(2)) : resolve(dirname(path), name);
  return [base, `${base}.ts`, `${base}.tsx`, `${base}.json`, resolve(base, 'index.ts'), resolve(base, 'index.tsx')].find(
    (path) => existsSync(path) && !readdirDirectory(path),
  );
};
function readdirDirectory(path) {
  try {
    readdirSync(path);
    return true;
  } catch {
    return false;
  }
}
const forbidden =
  /^(?:@medusajs(?:\/|$)|react-router(?:-dom)?(?:\/|$)|react-i18next(?:\/|$)|i18next(?:\/|$)|@tanstack\/react-router(?:\/|$)|next(?:\/|$))/;
const used = new Set();
for (const path of production) {
  for (const item of imports(path)) {
    const name = item.path;
    if (forbidden.test(name) || name.startsWith('@/')) errors.push(`Application-coupled import: ${relative(root, path)} -> ${name}`);
    if (name.startsWith('.')) {
      if (!resolveModule(path, name)) errors.push(`Missing relative import: ${relative(root, path)} -> ${name}`);
    } else {
      used.add(dependency(name));
      if (!dependencies.has(dependency(name))) errors.push(`Undeclared dashboard dependency: ${name}`);
    }
  }
  // scanImports intentionally erases type-only imports; catch forbidden type paths as well.
  if (
    /(?:from\s*|import\s*\()(['"])(?:@medusajs\/|react-router|react-i18next|i18next|next\/|@tanstack\/react-router)/.test(readFileSync(path, 'utf8'))
  )
    errors.push(`Forbidden runtime/type import in ${relative(root, path)}`);
}
const allowed = new Set(['adapted', 'adapted-test', 'consolidated', 'excluded-enterprise']);
for (const entry of manifest.files) {
  if (!allowed.has(entry.disposition)) errors.push(`Unresolved disposition: ${entry.source}`);
  if (entry.disposition === 'excluded-enterprise') {
    if (entry.target !== null || !entry.reason) errors.push(`Invalid exclusion: ${entry.source}`);
    const forbiddenTarget = resolve(dashboard, 'components', entry.source.split('/components/')[1]);
    if (existsSync(forbiddenTarget)) errors.push(`Excluded enterprise target exists: ${forbiddenTarget}`);
  } else {
    const target = resolve(root, entry.target);
    if (!existsSync(target) || hash(target) !== entry.targetSha256) errors.push(`Target missing/changed; review provenance: ${entry.target}`);
  }
  if (upstream) {
    const path = resolve(upstream, entry.source);
    if (!existsSync(path) || hash(path) !== entry.sha256) errors.push(`Upstream source hash mismatch: ${entry.source}`);
  }
}
for (const entry of manifest.supportFiles) {
  const target = resolve(root, entry.target);
  if (!existsSync(target) || hash(target) !== entry.sha256) errors.push(`Support file missing/changed; review provenance: ${entry.target}`);
  if (upstream && entry.source) {
    const path = resolve(upstream, entry.source);
    if (!existsSync(path) || hash(path) !== entry.sourceSha256) errors.push(`Support source hash mismatch: ${entry.source}`);
  }
}
if (upstream && execFileSync('git', ['-C', upstream, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim() !== manifest.revision)
  errors.push('The supplied upstream checkout is not at the pinned revision.');
const rootEntry = resolve(root, manifest.rootDocumentationEntry.path);
if (hash(rootEntry) !== manifest.rootDocumentationEntry.sha256)
  errors.push('Documentation root entry changed; explicitly review and update its recorded baseline.');
const visited = new Set();
const visit = (path) => {
  if (visited.has(path) || !/\.(ts|tsx)$/.test(path)) return;
  visited.add(path);
  for (const item of imports(path)) {
    if (item.path === '@cms/dashboard') errors.push(`Documentation entry reaches dashboard through ${relative(root, path)}`);
    if (!item.path.startsWith('.') && !item.path.startsWith('@/')) continue;
    const next = resolveModule(path, item.path);
    if (next?.startsWith(`${dashboard}/`)) errors.push(`Documentation entry reaches dashboard through ${relative(root, path)}`);
    else if (next) visit(next);
  }
};
visit(rootEntry);
if (pkg.exports['.'].import !== './dist/index.js' || Object.keys(pkg.exports).length !== 1)
  errors.push('Unexpected package export mapping.');
for (const path of ['licenses/medusa-MIT.txt', 'NOTICE.md', 'DASHBOARD.md', 'DASHBOARD-MIGRATION.md', 'DASHBOARD-VALIDATION.md'])
  if (!existsSync(resolve(root, path))) errors.push(`Missing required distribution document: ${path}`);
if (manifest.files.length !== 341 || manifest.files.filter((entry) => entry.disposition === 'excluded-enterprise').length !== 2)
  errors.push('Unexpected pinned inventory/exclusion count.');
// Source audits also work before building. When built artifacts are present,
// verify public distribution paths and reject inferred private vendor types.
const distributionArtifactsChecked = [];
for (const packageRoot of [resolve(root, '../ui'), root, resolve(root, '../docs-kit'), resolve(root, '../editor')]) {
  const metadata = JSON.parse(readFileSync(resolve(packageRoot, 'package.json'), 'utf8'));
  for (const group of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
    for (const name of Object.keys(metadata[group] ?? {})) {
      if (name === 'radix-ui' || name === 'cmdk' || name.startsWith('@radix-ui/'))
        errors.push(`Retired primitive dependency: ${metadata.name} -> ${name}`);
      if (name === '@cms/ui-preset') errors.push(`Removed preset dependency: ${metadata.name}`);
    }
  }
  if (!existsSync(resolve(packageRoot, 'dist'))) continue;
  const exportTargets = (value) => (typeof value === 'string' ? [value] : Object.values(value).flatMap(exportTargets));
  for (const target of new Set(exportTargets(metadata.exports))) {
    const path = resolve(packageRoot, target);
    if (!existsSync(path)) {
      errors.push(`Missing distribution export: ${metadata.name} -> ${target}`);
      continue;
    }
    if (!/\.(?:mjs|js|d\.mts|d\.ts)$/.test(path)) continue;
    distributionArtifactsChecked.push(`${metadata.name}:${target}`);
    const text = readFileSync(path, 'utf8');
    if (metadata.name === '@cms/ui' && target === './dist/tokens.mjs' && new Bun.Transpiler({ loader: 'js' }).scanImports(text).length) {
      errors.push('Token entry imports runtime modules; keep it standalone and React-free.');
    }
    if (/(?:from\s+|(?:import|require)\s*\(?\s*)['"](?:@radix-ui\/|(?:radix-ui|cmdk)['"])/.test(text))
      errors.push(`Retired primitive artifact import: ${metadata.name} -> ${target}`);
    if (/['"]@base-ui\/react\/(?:internals|floating-ui-react)\//.test(text))
      errors.push(`Private Base UI artifact import: ${metadata.name} -> ${target}`);
    if (metadata.name === '@cms/dashboard' && target === './dist/index.js' && !/^\s*['"]use client['"]/.test(text))
      errors.push('Missing dashboard client entry directive.');
    if (
      metadata.name === '@cms/docs-kit' &&
      target === './dist/index.d.ts' &&
      /\b(?:DashboardProvider|ConfigurableDataTable|RouteModalProvider|createDashboardTranslator|DataGridCommandBus)\b/.test(text)
    )
      errors.push('Documentation declarations contain dashboard-only symbols.');
  }
}
console.log(
  JSON.stringify(
    {
      revision: manifest.revision,
      ...manifest.summary,
      productionSourceFiles: production.length,
      dashboardDependencies: [...used].sort(),
      documentationModulesChecked: visited.size,
      upstreamHashesVerified: Boolean(upstream),
      distributionArtifactsChecked,
      errors,
    },
    null,
    2,
  ),
);
if (errors.length) process.exitCode = 1;
