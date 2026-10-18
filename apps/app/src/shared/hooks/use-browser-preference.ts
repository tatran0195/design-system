import { type SetStateAction, useCallback, useRef, useState, useSyncExternalStore } from 'react';

const subscribe = (listener: () => void) => {
  window.addEventListener('storage', listener);
  return () => window.removeEventListener('storage', listener);
};
const read = (key: string) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};
/** Primitive UI preferences only, never payloads or server data. Native storage
 * is the external source; a local fallback keeps denied-storage sessions usable. */
export function useBrowserPreference<Value extends string | number | boolean>(
  key: string,
  fallback: Value,
  decode: (raw: string) => Value,
  encode: (value: Value) => string = String,
) {
  const snapshot = useCallback(() => read(key), [key]);
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  const [local, setLocal] = useState<{ key: string; raw: string | null; value: Value } | null>(null);
  const value = local?.key === key && local.raw === raw ? local.value : raw === null ? fallback : decode(raw);
  const current = useRef(value);
  current.current = value;
  const setValue = (action: SetStateAction<Value>) => {
    const next = typeof action === 'function' ? action(current.current) : action;
    current.current = next;
    try {
      window.localStorage.setItem(key, encode(next));
    } catch {
      /* private/opaque storage */
    }
    setLocal({ key, raw: read(key), value: next });
  };
  return [value, setValue] satisfies [Value, (action: SetStateAction<Value>) => void];
}
