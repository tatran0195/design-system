import type { DataTableFilteringState, DataTablePaginationState, DataTableSortingState } from '@cms/ui';
import { useCallback, useMemo, useRef, useState } from 'react';
export interface DashboardTableState {
  search: string;
  pagination: DataTablePaginationState;
  sorting: DataTableSortingState | null;
  filtering: DataTableFilteringState;
  columnVisibility: Record<string, boolean>;
  columnOrder: string[];
}
export const createDashboardTableState = (initial: Partial<DashboardTableState> = {}): DashboardTableState => ({
  search: '',
  pagination: { pageIndex: 0, pageSize: 20 },
  sorting: null,
  filtering: {},
  columnVisibility: {},
  columnOrder: [],
  ...initial,
});
export interface DashboardTableStateOptions {
  state?: Partial<DashboardTableState>;
  initialState?: Partial<DashboardTableState>;
  onStateChange?: (state: DashboardTableState) => void;
}
export function useDashboardTableState({ state: controlled, initialState, onStateChange }: DashboardTableStateOptions = {}) {
  const [internal, setInternal] = useState(() => createDashboardTableState(initialState));
  const state = useMemo(() => ({ ...internal, ...controlled }), [internal, controlled]);
  const current = useRef(state);
  current.current = state;
  const change = useRef(onStateChange);
  change.current = onStateChange;
  const setState = useCallback((update: Partial<DashboardTableState> | ((current: DashboardTableState) => DashboardTableState)) => {
    const next = typeof update === 'function' ? update(current.current) : { ...current.current, ...update };
    current.current = next;
    setInternal(next);
    change.current?.(next);
  }, []);
  return { state, setState, reset: () => setState(createDashboardTableState(initialState)) };
}
