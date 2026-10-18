import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SEARCH_LIMIT_INCREMENT } from '../components/search/constants';
import { Search, type SearchProps } from '../components/search/search';
import type { SearchResultItem, SearchSource } from '../components/search/types';
import { DashboardProvider } from '../config';

const items: SearchResultItem[] = [
  { id: 'disabled', title: 'Unavailable action', disabled: true },
  { id: 'alpha', title: 'Alpha action', keywords: ['first'] },
  { id: 'beta', title: 'Beta action' },
];

function Harness(props: SearchProps) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open search
      </button>
      <Search {...props} open={open} onOpenChange={setOpen} debounceMs={0} />
    </>
  );
}

function deferred<T>() {
  let resolve: (value: T | PromiseLike<T>) => void = () => undefined;
  let reject: (reason?: unknown) => void = () => undefined;
  const promise = new Promise<T>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}

describe('Base UI command palette', () => {
  it('auto-highlights an enabled action and selects once by keyboard', async () => {
    const user = userEvent.setup();
    const selected = vi.fn();
    render(<Harness items={items} onSelect={selected} />);
    const input = screen.getByRole('combobox', { name: 'Search' });
    await waitFor(() => expect(input).toHaveFocus());
    await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'Alpha action' }).id));
    await user.keyboard('{ArrowDown}');
    expect(input).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'Beta action' }).id);
    // Base UI permits virtual focus on a disabled option, but never activation.
    await user.keyboard('{ArrowDown}');
    expect(input).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'Unavailable action' }).id);
    await user.keyboard('{Enter}');
    expect(selected).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Search' })).toBeVisible();
    await user.keyboard('{ArrowDown}');
    expect(input).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'Alpha action' }).id);
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(selected).toHaveBeenCalledExactlyOnceWith(items[1]);
  });

  it('keeps host keyword matching without a second vendor filter', async () => {
    const user = userEvent.setup();
    const ownAction = vi.fn();
    const selected = vi.fn();
    const item = { id: 'export', title: 'Export workspace', keywords: ['backup'], onSelect: ownAction };
    render(<Harness items={[item]} onSelect={selected} />);
    await user.type(screen.getByRole('combobox', { name: 'Search' }), 'backup');
    const option = await screen.findByRole('option', { name: 'Export workspace' });
    await user.click(option);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(selected).toHaveBeenCalledExactlyOnceWith(item);
    expect(ownAction).toHaveBeenCalledOnce();
  });

  it('preserves separate static and remote groups even when their record IDs match', async () => {
    const user = userEvent.setup();
    const selected = vi.fn();
    const dynamic = { id: 'same', title: 'Remote action' };
    const sources: SearchSource[] = [{ id: 'records', label: 'Records', search: async () => ({ items: [dynamic] }) }];
    render(<Harness items={[{ id: 'same', title: 'Static action' }]} sources={sources} onSelect={selected} />);
    expect(await screen.findByRole('option', { name: 'Remote action' })).toBeVisible();
    expect(screen.getByRole('group', { name: 'Commands and pages' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Records' })).toBeInTheDocument();
    const input = screen.getByRole('combobox', { name: 'Search' });
    await user.keyboard('{ArrowDown}');
    expect(input).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'Remote action' }).id);
    await user.keyboard('{Enter}');
    await waitFor(() => expect(selected).toHaveBeenCalledExactlyOnceWith(dynamic));
  });

  it('keeps the query while an action is pending and allows retry after rejection', async () => {
    const user = userEvent.setup();
    const pending = deferred<void>();
    const selected = vi.fn<(item: SearchResultItem) => Promise<void>>().mockReturnValueOnce(pending.promise).mockResolvedValue(undefined);
    render(<Harness items={items} onSelect={selected} />);
    const input = screen.getByRole('combobox', { name: 'Search' });
    await user.type(input, 'Alpha');
    await user.click(screen.getByRole('option', { name: 'Alpha action' }));
    expect(input).toHaveValue('Alpha');
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('option', { name: 'Alpha action' })).toHaveAttribute('aria-disabled', 'true');
    await user.keyboard('{Enter}');
    expect(selected).toHaveBeenCalledOnce();
    await act(async () => pending.reject(new Error('Host action failed')));
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to complete this action');
    expect(input).toHaveValue('Alpha');
    expect(screen.getByRole('dialog', { name: 'Search' })).toBeVisible();
    await user.click(screen.getByRole('option', { name: 'Alpha action' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(selected).toHaveBeenCalledTimes(2);
  });

  it('dismisses with one Escape and clears the query before reopening', async () => {
    const user = userEvent.setup();
    render(<Harness items={items} />);
    await user.type(screen.getByRole('combobox', { name: 'Search' }), 'Alpha');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Open search' }));
    expect(await screen.findByRole('combobox', { name: 'Search' })).toHaveValue('');
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('shows busy state before empty results, rather than announcing an empty loading list', async () => {
    const pending = deferred<{ items: SearchResultItem[] }>();
    const sources: SearchSource[] = [{ id: 'records', label: 'Records', search: () => pending.promise }];
    render(<Harness sources={sources} emptyMessage="Nothing found" />);
    await waitFor(() => expect(screen.getByRole('listbox')).toHaveAttribute('aria-busy', 'true'));
    expect(screen.queryByText('Nothing found')).not.toBeInTheDocument();
    await act(async () => pending.resolve({ items: [] }));
    expect(await screen.findByText('Nothing found')).toBeVisible();
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-busy', 'false');
  });

  it('retains successful sources, reports failures, and delegates expanded limits', async () => {
    const user = userEvent.setup();
    const search = vi.fn(async () => ({ items: [{ id: 'remote', title: 'Remote action' }], hasMore: true }));
    const sources: SearchSource[] = [
      { id: 'ok', label: 'Records', search },
      {
        id: 'bad',
        label: 'Unavailable source',
        search: async () => {
          throw new Error('Offline');
        },
      },
    ];
    render(<Harness sources={sources} initialLimit={2} />);
    expect(await screen.findByRole('option', { name: 'Remote action' })).toBeVisible();
    expect(await screen.findByRole('alert')).toHaveTextContent('Some search results could not be loaded');
    await user.click(screen.getByRole('button', { name: 'Show more results' }));
    await waitFor(() => expect(search).toHaveBeenLastCalledWith('', expect.objectContaining({ limit: 2 + SEARCH_LIMIT_INCREMENT })));
  });

  it('keeps the inline action list keyboard-operable under the shared RTL provider', async () => {
    const user = userEvent.setup();
    const selected = vi.fn();
    render(
      <DashboardProvider direction="rtl">
        <Harness items={items} onSelect={selected} />
      </DashboardProvider>,
    );
    const input = screen.getByRole('combobox', { name: 'Search' });
    await user.type(input, 'Beta');
    await user.keyboard('{Enter}');
    await waitFor(() => expect(selected).toHaveBeenCalledExactlyOnceWith(items[2]));
  });
});
