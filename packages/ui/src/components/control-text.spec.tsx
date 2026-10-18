import { readFileSync } from 'node:fs';
import { fileURLToPath, URL as NodeURL } from 'node:url';
import { cleanup, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { CurrencyInput } from './currency-input/currency-input';
import { Input } from './input/input';
import { Kbd } from './kbd/kbd';
import { Select } from './select/select';
import { Textarea } from './textarea/textarea';

afterEach(cleanup);

const sizes: ('base' | 'small')[] = ['base', 'small'];

describe('single-line control typography', () => {
  it('centers nonshrinking keycaps and preserves native props, refs, and height overrides', () => {
    const ref = createRef<HTMLElement>();
    render(
      <Kbd ref={ref} title="Escape" className="h-6">
        esc
      </Kbd>,
    );
    const keycap = screen.getByTitle('Escape');
    expect(keycap).toHaveClass('ui-control-text', 'items-center', 'justify-center', 'align-middle', 'shrink-0', 'whitespace-nowrap', 'h-6');
    expect(keycap).not.toHaveClass('h-5');
    expect(keycap).toHaveTextContent('esc');
    expect(ref.current).toBe(keycap);
  });

  for (const size of sizes) {
    it(`lets native ${size} inputs center placeholders and values without vertical padding`, () => {
      render(<Input size={size} aria-label="Name" placeholder="Placeholder" />);
      expect(screen.getByRole('textbox', { name: 'Name' })).toHaveClass('ui-control-text', 'py-0', size === 'base' ? 'h-8' : 'h-7');
    });

    it(`uses the same single-line leading for the ${size} dropdown trigger`, () => {
      render(
        <Select size={size}>
          <Select.Trigger aria-label="State">
            <Select.Value placeholder="Choose" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="draft">Draft</Select.Item>
          </Select.Content>
        </Select>,
      );
      expect(screen.getByRole('combobox', { name: 'State' })).toHaveClass('ui-control-text', 'items-center', 'py-0', size === 'base' ? 'h-8' : 'h-7');
    });
  }

  it('applies the shared leading to the native currency field, not just its wrapper', () => {
    render(<CurrencyInput aria-label="Amount" symbol="$" code="USD" placeholder="0.00" />);
    expect(screen.getByRole('textbox', { name: 'Amount' })).toHaveClass('ui-control-text', 'py-0');
  });

  it('keeps multiline textareas outside the single-line alignment policy', () => {
    render(<Textarea aria-label="Notes" placeholder="Notes" />);
    expect(screen.getByRole('textbox', { name: 'Notes' })).not.toHaveClass('ui-control-text');
    expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveClass('py-1.5', 'txt-small');
  });

  it('loads the shared rule after legacy typography from both supported component stylesheets', () => {
    for (const entry of ['../../theme.css', '../styles.css']) {
      const css = readFileSync(fileURLToPath(new NodeURL(entry, import.meta.url)), 'utf8');
      expect(css.indexOf('control-text.css')).toBeGreaterThan(css.indexOf('tokens.css'));
    }
    const controlCss = readFileSync(fileURLToPath(new NodeURL('../control-text.css', import.meta.url)), 'utf8');
    expect(controlCss).toContain('line-height: var(--ui-control-line-height, 1)');
    expect(controlCss).toContain('.ui-control-text::placeholder');
  });
});
