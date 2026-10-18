import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, URL as NodeURL } from 'node:url';
import * as tokens from './index';

const ui = fileURLToPath(new NodeURL('../..', import.meta.url));
const repository = resolve(ui, '../..');
const stylesheet = readFileSync(resolve(ui, 'tokens.css'), 'utf8');
const metadata = JSON.parse(readFileSync(resolve(ui, 'package.json'), 'utf8'));

function workspacePackages() {
  return ['packages', 'apps'].flatMap((directory) =>
    readdirSync(resolve(repository, directory), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => resolve(repository, directory, entry.name, 'package.json'))
      .filter(existsSync)
      .map((path) => JSON.parse(readFileSync(path, 'utf8'))),
  );
}

describe('merged UI theme and token entry', () => {
  it('retains the complete public token API and original font/theme data', () => {
    expect(Object.keys(tokens).sort()).toEqual(['FONT_FAMILY_MONO', 'FONT_FAMILY_SANS', 'colors', 'effects', 'theme', 'typography']);
    expect(tokens.FONT_FAMILY_SANS).toContain('Inter');
    expect(tokens.FONT_FAMILY_MONO).toContain('Roboto Mono');
    expect(tokens.theme.extend.colors.ui.fg.base.DEFAULT).toBe('var(--fg-base)');
    expect(tokens.theme.extend.boxShadow['elevation-modal']).toBe('var(--elevation-modal)');
    expect(tokens.typography['.txt-compact-xsmall'].fontSize).toBe('0.75rem');
  });

  // Migration snapshot: update deliberately if token data is changed later.
  it('retains the pre-merge token data and stylesheet byte-for-byte', () => {
    const baseline = {
      'src/tokens/constants.ts': '8bbcd68206b2f5c0a8e780326defda6d898fd10a5e6e40fcdd3491e11ee96c45',
      'src/tokens/theme.ts': 'e5a5fd685ee195170c16f8a478e3b062afd24b4244028757b41ef2999ee55ba8',
      'src/tokens/colors.ts': '44e2d22c39ce090fdd0aeddbda2bcc6a6185ef791d234b9cd9715d1a014bdb76',
      'src/tokens/effects.ts': '4fff2b2d59cd5fe0066acac4cda49c402e0fc547c213082da46ae70464ad5177',
      'src/tokens/typography.ts': 'b0b17ccd78de28861b99205055a2ae161d35183296f71f12146d2d8de8c608a2',
      'tokens.css': '350b38eddf76a8d67bf5c8fa3498812deed9aaf9ca441998b577ee7611724649',
    };
    for (const [path, expected] of Object.entries(baseline)) {
      const actual = createHash('sha256')
        .update(readFileSync(resolve(ui, path)))
        .digest('hex');
      expect(actual, path).toBe(expected);
    }
  });

  it('keeps existing CSS entries self-contained with shared layers and native animations', () => {
    const theme = readFileSync(resolve(ui, 'theme.css'), 'utf8');
    const developmentStyles = readFileSync(resolve(ui, 'src/styles.css'), 'utf8');
    expect(theme).toContain('@import "./tokens.css"');
    expect(theme).toContain('@import "./layers.css"');
    expect(developmentStyles).toContain('@import "../tokens.css"');
    expect(developmentStyles).toContain('@import "../layers.css"');
    expect(stylesheet).toContain('--accordion-panel-height');
    expect(stylesheet).toContain('[data-theme="dark"]');
  });

  it('keeps token modules free of React, CSS and other external imports', () => {
    for (const entry of readdirSync(resolve(ui, 'src/tokens')).filter((name) => name.endsWith('.ts') && !name.endsWith('.spec.ts'))) {
      const source = readFileSync(resolve(ui, 'src/tokens', entry), 'utf8');
      expect(source).not.toMatch(/^[\s;]*['"]use client['"]/);
      const paths = [...source.matchAll(/(?:from\s+|import\s*\(?\s*)['"]([^'"]+)['"]/g)].map((match) => match[1]);
      expect(
        paths.every((path) => path?.startsWith('.') && !path.endsWith('.css')),
        entry,
      ).toBe(true);
    }
  });

  it('does not retain the removed preset workspace or dependency declarations', () => {
    expect(existsSync(resolve(repository, 'packages/ui-preset'))).toBe(false);
    for (const pkg of workspacePackages()) {
      expect(pkg.name).not.toBe('@cms/ui-preset');
      for (const group of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
        expect(Object.keys(pkg[group] ?? {}), `${pkg.name} ${group}`).not.toContain('@cms/ui-preset');
      }
    }
  });

  it('publishes separate token/CSS entries and keeps Tailwind and CSS side effects', () => {
    expect(metadata.exports['./tokens']).toEqual({ types: './dist/tokens.d.mts', import: './dist/tokens.mjs', default: './dist/tokens.mjs' });
    expect(metadata.exports['./tokens.css']).toBe('./tokens.css');
    expect(metadata.files).toContain('tokens.css');
    expect(metadata.files).toContain('THEME.md');
    expect(metadata.sideEffects).toContain('**/*.css');
    expect(metadata.dependencies.tailwindcss).toBe('catalog:');
  });
});
