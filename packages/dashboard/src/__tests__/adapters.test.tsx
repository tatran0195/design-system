import { createDataTableColumnHelper } from '@cms/ui';
import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ProtectedRoute } from '../components/authentication/protected-route';
import { PermissionGuard } from '../components/common/permission-guard';
import { DataTable } from '../components/data-table';
import { SettingsSidebarLayoutComponent } from '../components/layout/settings-layout/settings-sidebar-layout-component';
import type { LayoutPersistenceAdapter, LayoutPreference } from '../components/layout-composer/types';
import { useSearchResults } from '../components/search/use-search-results';
import { ConfigurableDataTable } from '../components/table/configurable-data-table';
import { DashboardProvider } from '../config';
import { useLayoutPreference } from '../hooks/use-layout-preference';
import { type SavedView, type SavedViewsAdapter, useSavedViews } from '../hooks/use-saved-views';
import { Link, useSearchParams } from '../routing';

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};

describe('host adapters', () => {
  it('drops stale search results after the query changes', async () => {
    const first = deferred<{ items: { id: string; title: string }[] }>();
    const second = deferred<{ items: { id: string; title: string }[] }>();
    const signals: AbortSignal[] = [];
    const sources = [
      {
        id: 'records',
        label: 'Records',
        search: vi.fn((q: string, { signal }: { signal: AbortSignal }) => {
          signals.push(signal);
          return q === 'first' ? first.promise : second.promise;
        }),
      },
    ];
    const { result, rerender } = renderHook(({ q }) => useSearchResults({ q, sources, debounceMs: 0 }), { initialProps: { q: 'first' } });
    rerender({ q: 'second' });
    expect(signals[0]?.aborted).toBe(true);
    await act(async () => second.resolve({ items: [{ id: '2', title: 'Second' }] }));
    expect(result.current.dynamicResults[0]?.items[0]?.title).toBe('Second');
    await act(async () => first.resolve({ items: [{ id: '1', title: 'First' }] }));
    expect(result.current.dynamicResults[0]?.items[0]?.title).toBe('Second');
  });
  it('reports source failures while preserving successful groups', async () => {
    const sources = [
      { id: 'ok', label: 'OK', search: async () => ({ items: [{ id: '1', title: 'Found' }] }) },
      {
        id: 'bad',
        label: 'Bad',
        search: async () => {
          throw new Error('offline');
        },
      },
    ];
    const { result } = renderHook(() => useSearchResults({ sources, debounceMs: 0 }));
    await waitFor(() => expect(result.current.isFetching).toBe(false));
    expect(result.current.dynamicResults).toHaveLength(1);
    expect(result.current.errors).toHaveLength(1);
  });
  it('does not overwrite a newly saved view with a late initial load', async () => {
    const pending = deferred<SavedView<string>[]>();
    const adapter: SavedViewsAdapter<string> = { load: () => pending.promise, save: async (_key, view) => view, remove: async () => {} };
    const { result } = renderHook(() => useSavedViews({ key: 'records', adapter }));
    await act(async () => {
      await result.current.saveView({ id: 'fresh', name: 'Fresh', state: 'new' });
    });
    await act(async () => pending.resolve([{ id: 'old', name: 'Old', state: 'old' }]));
    expect(result.current.views.map((view) => view.id)).toEqual(['fresh']);
  });
  it('ignores view mutations that resolve for an old scope', async () => {
    const save = deferred<SavedView<string>>();
    const adapter: SavedViewsAdapter<string> = { load: async () => [], save: () => save.promise, remove: async () => {} };
    const { result, rerender } = renderHook(({ key }) => useSavedViews({ key, adapter }), { initialProps: { key: 'first' } });
    await waitFor(() => expect(result.current.loading).toBe(false));
    let request!: Promise<unknown>;
    act(() => {
      request = result.current.saveView({ id: '1', name: 'One', state: 'x' });
    });
    rerender({ key: 'second' });
    await act(async () => {
      save.resolve({ id: '1', name: 'One', state: 'x' });
      await request;
    });
    expect(result.current.views).toEqual([]);
    expect(result.current.activeId).toBeNull();
  });
  it('works with in-memory views and clears the active selection on deletion', async () => {
    const { result } = renderHook(() => useSavedViews<string>({ key: 'memory' }));
    await act(async () => {
      await result.current.saveView({ id: '1', name: 'One', state: 'x' });
    });
    expect(result.current.activeId).toBe('1');
    await act(async () => {
      await result.current.deleteView('1');
    });
    expect(result.current.activeId).toBeNull();
    expect(result.current.views).toHaveLength(0);
  });
  it('keeps edits made while layout preferences load', async () => {
    const pending = deferred<LayoutPreference | null>();
    const adapter: LayoutPersistenceAdapter = { load: () => pending.promise, save: async () => {} };
    const { result } = renderHook(() => useLayoutPreference('layout', adapter));
    act(() => result.current.onPreferenceChange({ widgets: { a: { hidden: true } } }));
    await act(async () => pending.resolve({ widgets: { old: { hidden: true } } }));
    expect(result.current.preference.widgets.a?.hidden).toBe(true);
    expect(result.current.preference.widgets.old).toBeUndefined();
  });
  it('does not persist layout changes until save is requested', async () => {
    const adapter = { load: async () => null, save: vi.fn(async () => {}) };
    const { result } = renderHook(() => useLayoutPreference('layout', adapter));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.onPreferenceChange({ widgets: { a: { order: 1 } } }));
    expect(adapter.save).not.toHaveBeenCalled();
    await act(async () => result.current.save());
    expect(adapter.save).toHaveBeenCalledWith('layout', { widgets: { a: { order: 1 } } });
  });
  it('delegates links and preserves unrelated host query parameters', () => {
    const navigate = vi.fn();
    function Probe() {
      const [, setParams] = useSearchParams();
      return (
        <button
          onClick={() =>
            setParams((previous) => {
              previous.set('q', 'new');
              return previous;
            })
          }
        >
          Update
        </button>
      );
    }
    render(
      <DashboardProvider router={{ location: { pathname: '/records', search: '?keep=yes' }, navigate }}>
        <Link to="/next">Next</Link>
        <Probe />
      </DashboardProvider>,
    );
    fireEvent.click(screen.getByRole('link', { name: 'Next' }));
    expect(navigate).toHaveBeenCalledWith('/next', expect.anything());
    fireEvent.click(screen.getByRole('button', { name: 'Update' }));
    expect(navigate).toHaveBeenLastCalledWith('/records?keep=yes&q=new', undefined);
  });
  it('denies presentation access unless the host authorizes it', () => {
    const { rerender } = render(
      <PermissionGuard permission="record:read" fallback="Denied">
        Allowed
      </PermissionGuard>,
    );
    expect(screen.getByText('Denied')).toBeInTheDocument();
    rerender(
      <DashboardProvider authorize={(permissions) => permissions.includes('record:read')}>
        <PermissionGuard permission="record:read">Allowed</PermissionGuard>
      </DashboardProvider>,
    );
    expect(screen.getByText('Allowed')).toBeInTheDocument();
  });
  it('does not render protected children while authentication loads', () => {
    const { rerender } = render(
      <ProtectedRoute status="loading" loading="Loading">
        Private
      </ProtectedRoute>,
    );
    expect(screen.queryByText('Private')).not.toBeInTheDocument();
    rerender(
      <ProtectedRoute status="unauthenticated" fallback="Sign in">
        Private
      </ProtectedRoute>,
    );
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });
  it('loads records through a generic table adapter without SDK/router providers', async () => {
    const helper = createDataTableColumnHelper<{ id: string; title: string }>();
    const load = vi.fn(async () => ({ data: [{ id: '1', title: 'Portable record' }], count: 1 }));
    render(
      <DashboardProvider>
        <ConfigurableDataTable
          heading="Records"
          adapter={{ key: 'records', columns: [helper.accessor('title', { header: 'Title' })], getRowId: (row) => row.id, load }}
          enableSearch={false}
        />
      </DashboardProvider>,
    );
    expect(await screen.findByText('Portable record')).toBeInTheDocument();
    expect(load).toHaveBeenCalledWith(expect.objectContaining({ search: '' }), expect.objectContaining({ signal: expect.any(AbortSignal) }));
  });
  it('passes the original record, not an internal table row, to host row callbacks', () => {
    const helper = createDataTableColumnHelper<{ id: string; title: string }>();
    const row = { id: 'record', title: 'Portable record' };
    const selected = vi.fn();
    render(
      <DashboardProvider>
        <DataTable
          data={[row]}
          columns={[helper.accessor('title', { header: 'Title' })]}
          getRowId={(row) => row.id}
          onRowClick={selected}
          enableSearch={false}
        />
      </DashboardProvider>,
    );
    fireEvent.click(screen.getByRole('row', { name: 'Portable record' }));
    expect(selected).toHaveBeenCalledWith(row);
  });
});

it('keeps settings groups keyboard-operable with localized labels in an RTL provider', async () => {
  render(
    <DashboardProvider direction="rtl" locale="ar" messages={{ 'actions.toggle': 'تبديل {{label}}', 'app.nav.settings.general': 'عام' }}>
      <SettingsSidebarLayoutComponent
        sections={{ general: <a href="/general">General settings link</a>, developer: <a href="/developer">Developer settings link</a> }}
      />
    </DashboardProvider>,
  );
  const toggle = screen.getByRole('button', { name: 'تبديل عام', exact: true });
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  toggle.focus();
  await userEvent.setup().keyboard('{Enter}');
  await waitFor(() => expect(toggle).toHaveAttribute('aria-expanded', 'false'));
  await waitFor(() => expect(screen.queryByRole('link', { name: 'General settings link' })).not.toBeInTheDocument());
  expect(screen.getByRole('link', { name: 'Developer settings link' })).toBeVisible();
});
