import { type Ref, type RefCallback, useMemo } from 'react';
/** Stable ref composition, including React 19 callback-ref cleanup functions. */
export function useCombinedRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return useMemo(
    () => (value: T | null) => {
      const cleanups = refs.map((ref) => {
        if (typeof ref === 'function') return { ref, cleanup: ref(value) };
        if (ref) ref.current = value;
        return { ref, cleanup: undefined };
      });
      return () => {
        for (const { ref, cleanup } of cleanups) {
          if (typeof cleanup === 'function') cleanup();
          else if (typeof ref === 'function') ref(null);
          else if (ref) ref.current = null;
        }
      };
    },
    refs,
  );
}
