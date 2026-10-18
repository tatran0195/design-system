import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const packages = fileURLToPath(new URL('../../../', import.meta.url));
const manifest = (name: string) => JSON.parse(readFileSync(resolve(packages, name, 'package.json'), 'utf8'));

describe('documentation package boundaries', () => {
  it('keeps dashboard UI in its own package and out of the docs entry points', () => {
    const dashboard = manifest('dashboard');
    const docs = manifest('docs-kit');

    expect(dashboard.name).toBe('@cms/dashboard');
    expect(dashboard.exports['.'].import).toBe('./dist/index.js');
    expect(Object.keys(docs.exports)).toEqual(['.']);
    expect(existsSync(resolve(packages, 'docs-kit/src/dashboard'))).toBe(false);
    expect(docs.dependencies['@dnd-kit/core']).toBeUndefined();
    expect(docs.dependencies['@tanstack/react-table']).toBeUndefined();
  });

  it('uses the dedicated documentation contracts rather than generic API types', () => {
    expect(manifest('docs-types').name).toBe('@cms/docs-types');
    expect(manifest('docs-utils').dependencies['@cms/docs-types']).toBe('workspace:*');
    expect(manifest('docs-utils').dependencies['@cms/types']).toBeUndefined();
    expect(existsSync(resolve(packages, 'types'))).toBe(false);
  });
});
