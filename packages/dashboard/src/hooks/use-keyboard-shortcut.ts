import { useEffect, useRef } from 'react';
export interface KeyboardShortcutOptions {
  key: string;
  mod?: boolean;
  shift?: boolean;
  alt?: boolean;
  enabled?: boolean;
  allowInInput?: boolean;
  preventDefault?: boolean;
}
export function useKeyboardShortcut(
  callback: (event: KeyboardEvent) => void,
  { key, mod = false, shift = false, alt = false, enabled = true, allowInInput = false, preventDefault = true }: KeyboardShortcutOptions,
) {
  const latest = useRef(callback);
  latest.current = callback;
  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return;
    const handle = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.isComposing ||
        event.repeat ||
        event.key.toLowerCase() !== key.toLowerCase() ||
        Boolean(event.metaKey || event.ctrlKey) !== mod ||
        event.shiftKey !== shift ||
        event.altKey !== alt
      )
        return;
      const target = event.target instanceof Element ? event.target : null;
      if (!allowInInput && target?.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
      if (preventDefault) event.preventDefault();
      latest.current(event);
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [key, mod, shift, alt, enabled, allowInInput, preventDefault]);
}
