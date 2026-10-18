import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DashboardProvider } from '../config';
import { useCommandHistory } from '../hooks/use-command-history';
import { useDashboardTableState } from '../hooks/use-dashboard-table-state';
import { useDate } from '../hooks/use-date';
import { useDebouncedValue } from '../hooks/use-debounced-value';
import { useDocumentDirection } from '../hooks/use-document-direction';
import { useKeyboardShortcut } from '../hooks/use-keyboard-shortcut';
import { parseJsonQuery, parseNonNegativeInteger } from '../hooks/use-query-params';
import { createDashboardTranslator } from '../i18n';

function command(id: number, calls: string[]) {
  return { execute: () => calls.push(`execute${id}`), undo: () => calls.push(`undo${id}`), redo: () => calls.push(`redo${id}`) };
}
describe('command history', () => {
  it('keeps the newest commands at the full capacity', () => {
    const calls: string[] = [];
    const { result } = renderHook(() => useCommandHistory(2));
    act(() => {
      result.current.execute(command(1, calls));
      result.current.execute(command(2, calls));
      result.current.execute(command(3, calls));
    });
    act(() => {
      result.current.undo();
      result.current.undo();
      result.current.undo();
    });
    expect(calls).toEqual(['execute1', 'execute2', 'execute3', 'undo3', 'undo2']);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
  });
  it('redos the full history and branches after an edit', () => {
    const calls: string[] = [];
    const { result } = renderHook(() => useCommandHistory(2));
    act(() => {
      result.current.execute(command(1, calls));
      result.current.execute(command(2, calls));
      result.current.undo();
      result.current.undo();
      result.current.redo();
      result.current.redo();
    });
    expect(calls.slice(-2)).toEqual(['redo1', 'redo2']);
    act(() => {
      result.current.undo();
      result.current.execute(command(3, calls));
    });
    expect(result.current.canRedo).toBe(false);
  });
  it('does not record failed commands', () => {
    const { result } = renderHook(() => useCommandHistory());
    expect(() =>
      result.current.execute({
        execute() {
          throw new Error('failed');
        },
        undo() {},
        redo() {},
      }),
    ).toThrow('failed');
    expect(result.current.canUndo).toBe(false);
  });
  it('supports zero capacity and clearing', () => {
    const { result } = renderHook(() => useCommandHistory(0));
    act(() => result.current.execute(command(1, [])));
    expect(result.current.canUndo).toBe(false);
    act(() => result.current.clear());
    expect(result.current.canRedo).toBe(false);
  });
});
describe('portable hooks and translations', () => {
  it('debounces and cancels previous values', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 100), { initialProps: { value: 'a' } });
    rerender({ value: 'b' });
    act(() => vi.advanceTimersByTime(50));
    rerender({ value: 'c' });
    act(() => vi.advanceTimersByTime(50));
    expect(result.current).toBe('a');
    act(() => vi.advanceTimersByTime(50));
    expect(result.current).toBe('c');
  });
  it('formats invalid dates safely, using an injected clock and locale', () => {
    const { result } = renderHook(() => useDate({ locale: 'en-US', now: () => new Date('2026-10-15T00:00:00Z') }));
    expect(result.current.getFullDate({ date: 'invalid' })).toBe('');
    expect(result.current.getRelativeDate('invalid')).toBe('');
    expect(result.current.getRelativeDate('2026-10-14T00:00:00Z')).toBe('yesterday');
    expect(result.current.getFullDate({ date: '2026-10-14T12:00:00Z' })).toContain('2026');
  });
  it('uses provider translations, interpolation, and plural rules', () => {
    const t = createDashboardTranslator({
      locale: 'en',
      messages: { rows_one: '{{count}} row', rows_other: '{{count}} rows', fields: { email: 'Mail address' } },
    });
    expect(t('rows', { count: 1 })).toBe('1 row');
    expect(t('rows', { count: 3 })).toBe('3 rows');
    expect(t('fields.email')).toBe('Mail address');
    expect(t('absent', { defaultValue: 'Fallback' })).toBe('Fallback');
  });
  it('does not share translator state between providers', () => {
    const a = createDashboardTranslator({ messages: { label: 'A' } });
    const b = createDashboardTranslator({ messages: { label: 'B' } });
    expect(a('label')).toBe('A');
    expect(b('label')).toBe('B');
  });
  it('honors scoped direction before document direction', () => {
    document.documentElement.dir = 'ltr';
    const { result } = renderHook(() => useDocumentDirection(), {
      wrapper: ({ children }) => <DashboardProvider direction="rtl">{children}</DashboardProvider>,
    });
    expect(result.current).toBe('rtl');
  });
  it('merges same-tick table updates rather than losing prior fields', () => {
    const changed = vi.fn();
    const { result } = renderHook(() => useDashboardTableState({ onStateChange: changed }));
    act(() => {
      result.current.setState({ search: 'hello' });
      result.current.setState({ sorting: { id: 'title', desc: true } });
    });
    expect(result.current.state.search).toBe('hello');
    expect(result.current.state.sorting?.desc).toBe(true);
    expect(changed).toHaveBeenCalledTimes(2);
  });
  it('respects controlled table state', () => {
    const { result } = renderHook(() => useDashboardTableState({ state: { search: 'controlled' } }));
    act(() => result.current.setState({ search: 'internal' }));
    expect(result.current.state.search).toBe('controlled');
  });
  it('guards invalid URL data and numeric offsets', () => {
    expect(parseJsonQuery('{bad')).toBeUndefined();
    expect(parseNonNegativeInteger('-1')).toBe(0);
    expect(parseNonNegativeInteger('12x')).toBe(0);
    expect(parseNonNegativeInteger('20')).toBe(20);
    expect(parseJsonQuery<boolean>('false', (value): value is boolean => typeof value === 'boolean')).toBe(false);
  });
  it('ignores shortcuts inside inputs and cleans up listeners', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useKeyboardShortcut(callback, { key: 'k', mod: true }));
    const input = document.createElement('input');
    document.body.append(input);
    act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true })));
    expect(callback).not.toHaveBeenCalled();
    act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true })));
    expect(callback).toHaveBeenCalledTimes(1);
    unmount();
    act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true })));
    expect(callback).toHaveBeenCalledTimes(1);
    input.remove();
  });
});
