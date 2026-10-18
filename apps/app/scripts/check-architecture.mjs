import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { parse } from '@babel/parser';
import { inspectGraph } from './architecture/graph.mjs';
import { writeReport } from './architecture/write-report.mjs';

const base = resolve(import.meta.dirname, '..');
const root = resolve(base, 'src');
const contract = JSON.parse(await readFile(resolve(base, 'architecture.json'), 'utf8'));
const modules = [];
async function* files(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = resolve(dir, e.name);
    if (e.isDirectory()) yield* files(p);
    else if (/\.[tj]sx?$/.test(p) && e.name !== 'routeTree.gen.ts') yield p;
  }
}
async function resolveLocal(file, source) {
  const part = source.split('?')[0];
  const p = part.startsWith('@/') ? resolve(root, part.slice(2)) : part.startsWith('.') ? resolve(dirname(file), part) : null;
  if (!p) return {};
  for (const candidate of [p, `${p}.ts`, `${p}.tsx`, `${p}.json`, `${p}/index.ts`, `${p}/index.tsx`]) {
    try {
      if ((await stat(candidate)).isFile())
        return { target: relative(root, candidate).replaceAll('\\', '/'), asset: /\.(?:json|css)$/.test(candidate) };
    } catch {}
  }
  return { target: relative(root, p), missing: true };
}
function walk(node, fn) {
  if (!node || typeof node !== 'object') return;
  if (node.type) fn(node);
  for (const [key, value] of Object.entries(node)) {
    if (['loc', 'start', 'end', 'extra', 'comments', 'tokens'].includes(key)) continue;
    if (Array.isArray(value)) for (const child of value) walk(child, fn);
    else if (value && typeof value === 'object') walk(value, fn);
  }
}
for await (const file of files(root)) {
  const source = await readFile(file, 'utf8');
  const ast = parse(source, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
  const module = { name: relative(root, file).replaceAll('\\', '/'), test: /\.(?:test|spec)\./.test(file), imports: [], exports: [] };
  const candidates = [];
  for (const node of ast.program.body) {
    if (node.source)
      candidates.push({
        source: node.source.value,
        typeOnly:
          node.importKind === 'type' ||
          node.exportKind === 'type' ||
          (node.type === 'ImportDeclaration' && node.specifiers.length > 0 && node.specifiers.every((item) => item.importKind === 'type')),
      });
    if (node.type === 'ExportAllDeclaration') module.exports.push('*');
    if (node.type === 'ExportNamedDeclaration') {
      const d = node.declaration;
      module.exports.push(
        ...(d?.id
          ? [d.id.name]
          : (d?.declarations?.map((item) => item.id.name).filter(Boolean) ??
            node.specifiers?.map((item) => item.exported.name ?? item.exported.value) ??
            [])),
      );
    }
  }
  walk(ast, (node) => {
    if (node.type === 'CallExpression' && node.callee.type === 'Import' && node.arguments[0]?.type === 'StringLiteral')
      candidates.push({ source: node.arguments[0].value, typeOnly: false });
  });
  for (const edge of candidates) module.imports.push({ ...edge, ...(await resolveLocal(file, edge.source)) });
  modules.push(module);
}
const byName = new Map(modules.map((module) => [module.name, module]));
const reachable = new Set();
function visit(name) {
  if (reachable.has(name)) return;
  reachable.add(name);
  for (const edge of byName.get(name)?.imports ?? []) if (edge.target) visit(edge.target);
}
for (const module of modules)
  if (
    module.test ||
    module.name.startsWith('routes/') ||
    contract.entries.includes(module.name) ||
    (contract.toolingEntries ?? []).includes(module.name) ||
    module.name.endsWith('.d.ts')
  )
    visit(module.name);
const unreachable = modules.map((module) => module.name).filter((name) => !reachable.has(name));
const errors = [...inspectGraph(modules, contract), ...unreachable.map((name) => `Unreachable module (declare a real entry or remove it): ${name}`)];
const report = {
  modules: modules.length,
  edges: modules.reduce((n, m) => n + m.imports.filter((i) => i.target).length, 0),
  errors,
  unreachable,
  featureDependencies: contract.featureDependencies,
  moduleMap: modules,
};
if (process.argv.includes('--report')) await writeReport(resolve(base, 'docs/architecture/evidence/final-architecture.json'), report);
for (const message of errors) console.error(message);
console.log(`Architecture: ${report.modules} modules, ${report.edges} local edges, ${errors.length} violations.`);
if (errors.length) process.exit(1);
