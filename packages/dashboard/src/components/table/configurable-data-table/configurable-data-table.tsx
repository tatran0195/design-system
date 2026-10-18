'use client';
import { Button, Container, type DataTableColumnDef, type DataTableFilter, Text } from '@cms/ui';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { type DashboardTableState, type DashboardTableStateOptions, useDashboardTableState } from '../../../hooks/use-dashboard-table-state';
import { DataTable, type DataTableProps } from '../../data-table';
export interface TableDataAdapter<TData extends object> {
  key: string;
  columns: DataTableColumnDef<TData, any>[];
  getRowId: (row: TData) => string;
  filters?: DataTableFilter[];
  load: (state: DashboardTableState, options: { signal: AbortSignal }) => Promise<{ data: TData[]; count: number }>;
}
export interface ConfigurableDataTableProps<TData extends object>
  extends DashboardTableStateOptions,
    Omit<DataTableProps<TData>, 'data' | 'columns' | 'getRowId' | 'filters' | 'isLoading' | 'rowCount'> {
  adapter: TableDataAdapter<TData>;
  renderError?: (error: unknown, retry: () => void) => ReactNode;
}
export function ConfigurableDataTable<TData extends object>({
  adapter,
  renderError,
  state: controlled,
  initialState,
  onStateChange,
  pageSize = 20,
  ...props
}: ConfigurableDataTableProps<TData>) {
  const { state, setState } = useDashboardTableState({
    state: controlled,
    initialState: { pagination: { pageIndex: 0, pageSize }, ...initialState },
    onStateChange,
  });
  const [result, setResult] = useState<{ data: TData[]; count: number }>({ data: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [revision, refresh] = useState(0);
  const serialized = JSON.stringify(state);
  const latest = useRef({ adapter, state });
  latest.current = { adapter, state };
  useEffect(() => {
    const controller = new AbortController();
    const { adapter, state } = latest.current;
    setLoading(true);
    setError(null);
    Promise.resolve()
      .then(() => adapter.load(state, { signal: controller.signal }))
      .then((value) => {
        if (!controller.signal.aborted) setResult(value);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(error);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [adapter.key, serialized, revision]);
  const retry = () => refresh((value) => value + 1);
  if (error)
    return (
      <>
        {renderError?.(error, retry) ?? (
          <Container role="alert">
            <Text className="text-ui-fg-error mb-3">Unable to load these records.</Text>
            <Button variant="secondary" onClick={retry}>
              Try again
            </Button>
          </Container>
        )}
      </>
    );
  return (
    <DataTable
      {...props}
      data={result.data}
      rowCount={result.count}
      columns={adapter.columns}
      filters={adapter.filters}
      getRowId={adapter.getRowId}
      isLoading={loading}
      pageSize={pageSize}
      state={state}
      onStateChange={setState}
    />
  );
}
