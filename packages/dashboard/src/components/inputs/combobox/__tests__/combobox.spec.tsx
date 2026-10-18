import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CountrySelect } from '../../country-select';
import { Combobox } from '../combobox';

const options = [
  { value: 'alpha', label: 'Alpha' },
  { value: 'beta', label: 'Beta' },
  { value: 'blocked', label: 'Blocked', disabled: true },
];
async function open(name = 'Choose') {
  const input = screen.getByRole('combobox', { name });
  act(() => input.focus());
  await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'));
  return input;
}
describe('portable combobox', () => {
  it('shares single-line input alignment in both dropdown display modes', () => {
    render(
      <>
        <Combobox aria-label="Single" placeholder="Choose" options={options} />
        <Combobox<string[]> aria-label="Chips" placeholder="Choose" options={options} multiple displayMode="chips" />
      </>,
    );
    for (const input of screen.getAllByRole('combobox')) {
      expect(input).toHaveClass('ui-control-text', 'py-0');
    }
  });

  it('renders without IntersectionObserver or SDK/router/query providers', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    render(<Combobox aria-label="Choose" options={options} />);
    await open();
    expect(await screen.findByRole('option', { name: 'Alpha' })).toBeInTheDocument();
  });
  it('supports an uncontrolled default selection and clearing', async () => {
    render(<Combobox aria-label="Choose" defaultValue="alpha" options={options} allowClear />);
    expect(screen.getAllByText('Alpha').some((node) => !node.closest('[hidden]'))).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(screen.queryByRole('button', { name: 'Clear selection' })).not.toBeInTheDocument();
  });
  it('clears controlled undefined values instead of switching to stale internal state', async () => {
    function Probe() {
      const [value, setValue] = useState<string | undefined>('alpha');
      return <Combobox aria-label="Choose" value={value} onChange={setValue} options={options} allowClear />;
    }
    render(<Probe />);
    fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Clear selection' })).not.toBeInTheDocument());
  });
  it('handles multi-select in uncontrolled mode and only creates actual new values', async () => {
    const create = vi.fn();
    const change = vi.fn();
    render(
      <Combobox<string[]>
        aria-label="Choose"
        multiple
        defaultValue={[]}
        options={options}
        onChange={change}
        onCreateOption={create}
        displayMode="chips"
      />,
    );
    await open();
    fireEvent.click(await screen.findByRole('option', { name: 'Alpha' }));
    await waitFor(() => expect(change).toHaveBeenCalledWith(['alpha']));
    expect(create).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Remove Alpha' })).toBeInTheDocument();
  });
  it('uses only host-supplied country options and honors defaultValue', () => {
    render(<CountrySelect aria-label="Country" countries={[{ iso_2: 'vn', display_name: 'Vietnam' }]} defaultValue="vn" />);
    expect(screen.getAllByText('Vietnam').some((node) => !node.closest('[hidden]'))).toBe(true);
    expect(screen.queryByText('Canada')).not.toBeInTheDocument();
  });
  it('does not expose an enabled dropdown disclosure on a disabled input', () => {
    render(<Combobox aria-label="Choose" options={options} disabled />);
    expect(screen.getByRole('button', { name: 'Toggle options' })).toBeDisabled();
  });
});
