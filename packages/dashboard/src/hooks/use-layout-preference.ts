import { useCallback, useEffect, useRef, useState } from 'react';
import type { LayoutPersistenceAdapter, LayoutPreference } from '../components/layout-composer/types';

const EMPTY: LayoutPreference = { widgets: {} };
/** In-memory by default. Explicit async persistence only; no implicit localStorage. */
export function useLayoutPreference(key: string, adapter?: LayoutPersistenceAdapter, initial: LayoutPreference = EMPTY) {
  const [preference, setPreference] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(0);
  const [error, setError] = useState<unknown>(null);
  const initialRef = useRef(initial);
  initialRef.current = initial;
  const generation = useRef(0);
  const revision = useRef(0);
  const queue = useRef(Promise.resolve());
  const current = useRef(preference);
  current.current = preference;
  useEffect(() => {
    const initial = initialRef.current;
    const controller = new AbortController();
    const token = ++generation.current;
    revision.current = 0;
    queue.current = Promise.resolve();
    current.current = initial;
    setPreference(initial);
    setError(null);
    setPending(0);
    if (!adapter) {
      setLoading(false);
      return () => {
        controller.abort();
        generation.current++;
      };
    }
    setLoading(true);
    const version = revision.current;
    Promise.resolve()
      .then(() => adapter.load(key, controller.signal))
      .then((value) => {
        if (!controller.signal.aborted && token === generation.current && revision.current === version) {
          current.current = value ?? initial;
          setPreference(value ?? initial);
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted && token === generation.current && revision.current === version) setError(error);
      })
      .finally(() => {
        if (!controller.signal.aborted && token === generation.current) setLoading(false);
      });
    return () => {
      controller.abort();
      generation.current++;
    };
  }, [key, adapter]);
  const onPreferenceChange = useCallback((value: LayoutPreference) => {
    revision.current++;
    current.current = value;
    setPreference(value);
  }, []);
  const save = useCallback(async () => {
    if (!adapter) return;
    const value = current.current;
    const token = generation.current;
    setPending((count) => count + 1);
    setError(null);
    const operation = queue.current.catch(() => {}).then(() => adapter.save(key, value));
    queue.current = operation;
    try {
      await operation;
    } catch (error) {
      if (token === generation.current) setError(error);
      throw error;
    } finally {
      if (token === generation.current) setPending((count) => Math.max(0, count - 1));
    }
  }, [key, adapter]);
  return { preference, onPreferenceChange, save, loading, saving: pending > 0, error, reset: () => onPreferenceChange(initialRef.current) };
}
