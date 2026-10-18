'use client';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StackedModalContext } from './stacked-modal-context';
export function StackedModalProvider({ children, onOpenChange }: { children: ReactNode; onOpenChange?: (open: boolean) => void }) {
  const [state, setState] = useState<Record<string, boolean>>({});
  const callback = useRef(onOpenChange);
  callback.current = onOpenChange;
  const anyOpen = Object.values(state).some(Boolean);
  useEffect(() => {
    callback.current?.(anyOpen);
  }, [anyOpen]);
  const register = useCallback((id: string) => setState((previous) => (id in previous ? previous : { ...previous, [id]: false })), []);
  const unregister = useCallback(
    (id: string) =>
      setState((previous) => {
        const next = { ...previous };
        delete next[id];
        return next;
      }),
    [],
  );
  const setIsOpen = useCallback(
    (id: string, open: boolean) => setState((previous) => (previous[id] === open ? previous : { ...previous, [id]: open })),
    [],
  );
  const getIsOpen = useCallback((id: string) => state[id] ?? false, [state]);
  const value = useMemo(() => ({ getIsOpen, setIsOpen, register, unregister }), [getIsOpen, setIsOpen, register, unregister]);
  return <StackedModalContext.Provider value={value}>{children}</StackedModalContext.Provider>;
}
