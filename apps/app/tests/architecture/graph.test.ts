import { describe, expect, it } from 'vitest';
import { inspectGraph } from '../../scripts/architecture/graph.mjs';

const contract = { entries: [], publicEntries: ['index.ts', 'api.ts'], featureDependencies: { a: ['b'], b: ['a'] } };
const module = (name: string, target?: string) => ({
  name,
  exports: [],
  test: false,
  imports: target ? [{ target, source: `@/${target}`, typeOnly: false }] : [],
});
describe('architecture fitness rules are active', () => {
  it('rejects private feature imports', () =>
    expect(inspectGraph([module('features/a/view.ts', 'features/b/internal.ts')], contract).join()).toContain('Private module access'));
  it('rejects shared business coupling', () =>
    expect(inspectGraph([module('shared/helper.ts', 'features/b/api.ts')], contract).join()).toContain('Shared depends upward'));
  it('rejects composition dependencies from features', () =>
    expect(inspectGraph([module('features/a/view.ts', 'app/layout.ts')], contract).join()).toContain('Feature depends on composition'));
  it('detects cycles across otherwise public interfaces', () =>
    expect(
      inspectGraph([module('features/a/api.ts', 'features/b/api.ts'), module('features/b/api.ts', 'features/a/api.ts')], contract).join(),
    ).toContain('Feature cycle'));
  it('rejects wildcard and duplicate public exports', () =>
    expect(inspectGraph([{ ...module('features/a/index.ts'), exports: ['*', 'Thing', 'Thing'] }], contract)).toHaveLength(2));
  it('accepts explicit acyclic feature APIs', () =>
    expect(inspectGraph([module('features/a/view.ts', 'features/b/api.ts'), module('features/b/api.ts')], contract)).toEqual([]));
});

it('requires registration of a new feature owner', () => {
  expect(inspectGraph([module('features/unregistered/view.ts')], contract).join()).toContain('Unregistered feature owner');
});
