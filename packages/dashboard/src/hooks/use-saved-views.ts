import { useCallback, useEffect, useRef, useState } from 'react';
import type { DashboardTableState } from './use-dashboard-table-state';
export interface SavedView<TState = DashboardTableState> {
  id: string;
  name: string;
  state: TState;
  description?: string;
}
export interface SavedViewsAdapter<TState = DashboardTableState> {
  load: (key: string, signal: AbortSignal) => Promise<SavedView<TState>[]>;
  save: (key: string, view: SavedView<TState>) => Promise<SavedView<TState>>;
  remove: (key: string, id: string) => Promise<void>;
}
const EMPTY: never[] = [];
export function useSavedViews<TState = DashboardTableState>({
  key,
  adapter,
  initialViews = EMPTY,
}: {
  key: string;
  adapter?: SavedViewsAdapter<TState>;
  initialViews?: SavedView<TState>[];
}) {
  const [views, setViews] = useState(initialViews);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(0);
  const [error, setError] = useState<unknown>(null);
  const generation = useRef(0);
  const revision = useRef(0);
  const queue = useRef(Promise.resolve<unknown>(undefined));
  const initial = useRef(initialViews);
  initial.current = initialViews;
  useEffect(() => {
    const token = ++generation.current;
    const controller = new AbortController();
    revision.current = 0;
    queue.current = Promise.resolve(undefined);
    setViews(initial.current);
    setActiveId(null);
    setError(null);
    setPending(0);
    if (!adapter) {
      setLoading(false);
      return () => {
        generation.current++;
      };
    }
    setLoading(true);
    const version = revision.current;
    Promise.resolve()
      .then(() => adapter.load(key, controller.signal))
      .then((data) => {
        if (!controller.signal.aborted && token === generation.current && version === revision.current) setViews(data);
      })
      .catch((error) => {
        if (!controller.signal.aborted && token === generation.current && version === revision.current) setError(error);
      })
      .finally(() => {
        if (!controller.signal.aborted && token === generation.current) setLoading(false);
      });
    return () => {
      controller.abort();
      generation.current++;
    };
  }, [key, adapter]);
  const saveView = useCallback(
    async (view: SavedView<TState>) => {
      const token = generation.current;
      revision.current++;
      setPending((count) => count + 1);
      setError(null);
      const operation = queue.current.catch(() => {}).then(() => (adapter ? adapter.save(key, view) : view));
      queue.current = operation;
      try {
        const saved = await operation;
        if (token === generation.current) {
          setViews((previous) =>
            previous.some((item) => item.id === saved.id) ? previous.map((item) => (item.id === saved.id ? saved : item)) : [...previous, saved],
          );
          setActiveId(saved.id);
        }
        return saved;
      } catch (error) {
        if (token === generation.current) setError(error);
        throw error;
      } finally {
        if (token === generation.current) setPending((count) => Math.max(0, count - 1));
      }
    },
    [key, adapter],
  );
  const deleteView = useCallback(
    async (id: string) => {
      const token = generation.current;
      revision.current++;
      setPending((count) => count + 1);
      setError(null);
      const operation = queue.current.catch(() => {}).then(() => adapter?.remove(key, id));
      queue.current = operation;
      try {
        await operation;
        if (token === generation.current) {
          setViews((previous) => previous.filter((view) => view.id !== id));
          setActiveId((previous) => (previous === id ? null : previous));
        }
      } catch (error) {
        if (token === generation.current) setError(error);
        throw error;
      } finally {
        if (token === generation.current) setPending((count) => Math.max(0, count - 1));
      }
    },
    [key, adapter],
  );
  return { views, activeId, setActiveId, saveView, deleteView, loading, saving: pending > 0, error };
}
