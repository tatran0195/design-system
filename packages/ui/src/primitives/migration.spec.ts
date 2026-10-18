import { readdirSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { fileURLToPath, URL as NodeURL } from 'node:url';

const ui = fileURLToPath(new NodeURL('../..', import.meta.url));
const repository = resolve(ui, '../..');
const dashboard = resolve(ui, '../dashboard');

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : /\.[cm]?[jt]sx?$/.test(path) ? [path] : [];
  });
}

const sources = [...sourceFiles(resolve(ui, 'src')), ...sourceFiles(resolve(dashboard, 'src'))];

describe('Base UI migration boundaries', () => {
  it('does not restore Radix or Radix-backed command imports in CMS UI/dashboard sources', () => {
    const vendorImport = /(?:from\s+|(?:import|require)\s*\(?\s*)['"](?:@radix-ui\/|(?:radix-ui|cmdk)(?:['"]|\/))/;
    expect(sources.filter((path) => vendorImport.test(readFileSync(path, 'utf8'))).map((path) => relative(repository, path))).toEqual([]);
  });

  it('uses Base UI without restoring direct Radix package dependencies', () => {
    const retired: string[] = [];
    for (const directory of [ui, dashboard]) {
      const pkg = JSON.parse(readFileSync(resolve(directory, 'package.json'), 'utf8'));
      expect(pkg.dependencies?.['@base-ui/react'], pkg.name).toBeTruthy();
      for (const group of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
        for (const name of Object.keys(pkg[group] ?? {})) {
          if (name === 'radix-ui' || name === 'cmdk' || name.startsWith('@radix-ui/')) retired.push(`${pkg.name}:${group}:${name}`);
        }
      }
    }
    expect(retired).toEqual([]);
  });

  it('removes the retired command and Radix packages from the resolved lockfile', () => {
    const lockfile = readFileSync(resolve(repository, 'bun.lock'), 'utf8');
    expect(lockfile.match(/"(?:@radix-ui\/[^"]+|radix-ui|cmdk)(?:@[^"]+)?"/g)).toBeNull();
  });

  it('uses public Base UI entry points instead of implementation internals', () => {
    const privateImport = /['"]@base-ui\/react\/(?:internals|floating-ui-react)\//;
    expect(sources.filter((path) => privateImport.test(readFileSync(path, 'utf8'))).map((path) => relative(repository, path))).toEqual([]);
  });
});
