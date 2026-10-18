import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useLayoutPreference } from '../hooks/use-layout-preference';
import { type SavedView, type SavedViewsAdapter, useSavedViews } from '../hooks/use-saved-views';

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
};
describe('persistence ordering and lifecycle regressions', () => {
  it('serializes saved view writes including removals and recovers after rejection', async () => {
    const first = deferred<SavedView<string>>();
    const remove = vi.fn(async () => {});
    const save = vi.fn((_key: string, view: SavedView<string>) => (save.mock.calls.length === 1 ? first.promise : Promise.resolve(view)));
    const adapter: SavedViewsAdapter<string> = { load: async () => [], save, remove };
    const { result } = renderHook(() => useSavedViews<string>({ key: 'scope', adapter }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    let a!: Promise<unknown>;
    let b!: Promise<unknown>;
    act(() => {
      a = result.current.saveView({ id: 'one', name: 'One', state: 'first' }).catch(() => {});
      b = result.current.deleteView('one');
    });
    await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
    expect(remove).not.toHaveBeenCalled();
    expect(result.current.saving).toBe(true);
    await act(async () => {
      first.reject(new Error('offline'));
      await a;
      await b;
    });
    expect(remove).toHaveBeenCalledTimes(1);
    expect(result.current.saving).toBe(false);
    await act(async () => {
      await result.current.saveView({ id: 'two', name: 'Two', state: 'second' });
    });
    expect(result.current.views.map((view) => view.id)).toEqual(['two']);
    expect(result.current.error).toBeNull();
  });
  it('serializes snapshots of layout writes and resets pending state after a scope change', async () => {
    const first = deferred<void>();
    const save = vi.fn(() => (save.mock.calls.length === 1 ? first.promise : Promise.resolve()));
    const adapter = { load: async () => null, save };
    const { result, rerender } = renderHook(({ key }) => useLayoutPreference(key, adapter), { initialProps: { key: 'a' } });
    await waitFor(() => expect(result.current.loading).toBe(false));
    let a!: Promise<void>;
    let b!: Promise<void>;
    act(() => {
      result.current.onPreferenceChange({ widgets: { one: { order: 1 } } });
      a = result.current.save();
      result.current.onPreferenceChange({ widgets: { two: { order: 2 } } });
      b = result.current.save();
    });
    await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
    rerender({ key: 'b' });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.preference.widgets).toEqual({});
    expect(result.current.saving).toBe(false);
    await act(async () => {
      first.resolve();
      await a;
      await b;
    });
    expect(save).toHaveBeenLastCalledWith('a', { widgets: { two: { order: 2 } } });
    expect(result.current.preference.widgets).toEqual({});
  });
  it('does not reinitialize when an inline default layout object changes identity', async () => {
    const { result, rerender } = renderHook(() => useLayoutPreference('inline', undefined, { widgets: {} }));
    act(() => result.current.onPreferenceChange({ widgets: { a: { hidden: true } } }));
    rerender();
    expect(result.current.preference.widgets.a?.hidden).toBe(true);
  });
  it('aborts pending reads on unmount and contains synchronous adapter failures', async () => {
    const load = vi.fn((_key: string, _signal: AbortSignal) => {
      throw new Error('synchronous');
    });
    const adapter = { load, save: async (_key: string, view: SavedView) => view, remove: async () => {} };
    const { result, unmount } = renderHook(() => useSavedViews({ key: 'scope', adapter }));
    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
    const signal = load.mock.calls[0]![1];
    unmount();
    expect(signal.aborted).toBe(true);
    const layoutAdapter = {
      load: () => {
        throw new Error('sync layout');
      },
      save: async () => {},
    };
    const layout = renderHook(() => useLayoutPreference('scope', layoutAdapter));
    await waitFor(() => expect(layout.result.current.error).toBeInstanceOf(Error));
    layout.unmount();
  });
});
