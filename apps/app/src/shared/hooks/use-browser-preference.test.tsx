// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useBrowserPreference } from './use-browser-preference';

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});
it('preserves existing storage keys and applies consecutive functional actions', () => {
  const { result } = renderHook(() => useBrowserPreference('editor.width', 260, Number));
  act(() => {
    result.current[1]((value) => value + 1);
    result.current[1]((value) => value + 1);
  });
  expect(result.current[0]).toBe(262);
  expect(localStorage.getItem('editor.width')).toBe('262');
});
it('works when browser storage is denied', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new DOMException('Denied');
  });
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('Denied');
  });
  const { result } = renderHook(() => useBrowserPreference('editor.rail', false, (raw) => raw === 'true'));
  act(() => result.current[1](true));
  expect(result.current[0]).toBe(true);
});
it('reads an existing preference without an effect-based state copy', () => {
  localStorage.setItem('editor.width', '300');
  const { result } = renderHook(() => useBrowserPreference('editor.width', 260, Number));
  expect(result.current[0]).toBe(300);
});
