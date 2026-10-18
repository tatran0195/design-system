'use client';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type To, useNavigate } from '../../../routing';
import { RouteModalProviderContext } from './route-modal-context';
export interface RouteModalProviderProps {
  children: ReactNode;
  prev?: To | number;
  onClose?: () => void;
  onSuccess?: (path?: string) => void;
  onCloseError?: (error: unknown) => void;
}
export function RouteModalProvider({ children, prev, onClose, onSuccess, onCloseError }: RouteModalProviderProps) {
  const navigate = useNavigate();
  const [closeOnEscape, setCloseOnEscape] = useState(true);
  const guards = useRef(new Set<() => boolean | Promise<boolean>>());
  const pending = useRef<Promise<boolean> | null>(null);
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  const callbacks = useRef({ prev, onClose, onSuccess, onCloseError, navigate });
  callbacks.current = { prev, onClose, onSuccess, onCloseError, navigate };
  const finish = useCallback((success: boolean, path?: string) => {
    const current = callbacks.current;
    current.onClose?.();
    if (success) current.onSuccess?.(path);
    const target = path ?? current.prev;
    if (target !== undefined) current.navigate(target, { replace: typeof target !== 'number' });
  }, []);
  const registerCloseGuard = useCallback((guard: () => boolean | Promise<boolean>) => {
    guards.current.add(guard);
    return () => {
      guards.current.delete(guard);
    };
  }, []);
  const requestClose = useCallback(() => {
    if (pending.current) return pending.current;
    pending.current = (async () => {
      for (const guard of guards.current) {
        if (!(await guard()) || !active.current) return false;
      }
      if (!active.current) return false;
      finish(false);
      return true;
    })()
      .catch((error) => {
        if (active.current) callbacks.current.onCloseError?.(error);
        return false;
      })
      .finally(() => {
        pending.current = null;
      });
    return pending.current;
  }, [finish]);
  const handleSuccess = useCallback((path?: string) => finish(true, path), [finish]);
  const value = useMemo(
    () => ({ handleSuccess, requestClose, registerCloseGuard, setCloseOnEscape, __internal: { closeOnEscape } }),
    [handleSuccess, requestClose, registerCloseGuard, closeOnEscape],
  );
  return <RouteModalProviderContext.Provider value={value}>{children}</RouteModalProviderContext.Provider>;
}
