import { useCallback, useSyncExternalStore } from 'react';
/** SSR-safe responsive state. The host can choose the server/hydration fallback. */
export function useMediaQuery(query: string, serverMatches = false): boolean {
  const subscribe = useCallback(
    (notify: () => void) => {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {};
      const media = window.matchMedia(query);
      if (media.addEventListener) {
        media.addEventListener('change', notify);
        return () => media.removeEventListener('change', notify);
      }
      media.addListener(notify);
      return () => media.removeListener(notify);
    },
    [query],
  );
  const snapshot = useCallback(
    () => (typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia(query).matches : serverMatches),
    [query, serverMatches],
  );
  return useSyncExternalStore(subscribe, snapshot, () => serverMatches);
}
