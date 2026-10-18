'use client';

import {
    Button,
    type DataTableColumnDef,
    type DataTableCommand,
    type DataTableEmptyStateProps,
    type DataTableFilter,
    type DataTableRow,
    type DataTableRowSelectionState,
    Heading,
    Text,
    Tooltip,
    DataTable as UiDataTable,
    useDataTable,
} from '@cms/ui';
import type { ReactNode } from 'react';
import { type DashboardTableStateOptions, useDashboardTableState } from '../../hooks/use-dashboard-table-state';
import { useTranslation } from '../../i18n';
import { Link, useNavigate } from '../../routing';
import { ActionMenu } from '../common/action-menu';
import { LocalizedTablePagination } from '../localization/localized-table-pagination';
import { ViewPills, type ViewPillsProps } from '../table/view-selector';
export type DataTableActionProps = { label: string; disabled?: boolean; tooltip?: ReactNode } & ({ to: string } | { onClick: () => void });
export interface DataTableProps<TData extends object> extends DashboardTableStateOptions {
  data?: TData[];
  columns: DataTableColumnDef<TData, any>[];
  filters?: DataTableFilter[];
  commands?: DataTableCommand[];
  action?: DataTableActionProps;
  actions?: DataTableActionProps[];
  actionMenu?: React.ComponentProps<typeof ActionMenu>;
  rowCount?: number;
  getRowId: (row: TData) => string;
  enablePagination?: boolean;
  enableSearch?: boolean;
  autoFocusSearch?: boolean;
  rowHref?: (row: TData) => string;
  onRowClick?: (row: TData) => void;
  emptyState?: DataTableEmptyStateProps;
  heading?: string;
  headingLevel?: 'h1' | 'h2' | 'h3';
  subHeading?: string;
  pageSize?: number;
  isLoading?: boolean;
  layout?: 'fill' | 'auto';
  enableColumnVisibility?: boolean;
  rowSelection?: {
    state: DataTableRowSelectionState;
    onRowSelectionChange: (value: DataTableRowSelectionState) => void;
    enableRowSelection?: boolean | ((row: DataTableRow<TData>) => boolean);
  };
  views?: ViewPillsProps;
  filterBarContent?: ReactNode;
  className?: string;
}
/** Presentation table: pass already-filtered/paginated rows, or use ConfigurableDataTable's loader adapter. */
export function DataTable<TData extends object>({
  data = [],
  columns,
  filters,
  commands,
  action,
  actions,
  actionMenu,
  rowCount = data.length,
  getRowId,
  enablePagination = true,
  enableSearch = true,
  autoFocusSearch,
  rowHref,
  onRowClick,
  emptyState,
  heading,
  headingLevel = 'h1',
  subHeading,
  pageSize = 20,
  isLoading,
  layout = 'auto',
  enableColumnVisibility = false,
  rowSelection,
  views,
  filterBarContent,
  className,
  state: controlled,
  initialState,
  onStateChange,
}: DataTableProps<TData>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state, setState } = useDashboardTableState({
    state: controlled,
    initialState: { pagination: { pageIndex: 0, pageSize }, ...initialState },
    onStateChange,
  });
  const sortingEnabled = columns.some((column) => column.enableSorting);
  const filteringEnabled = Boolean(filters?.length);
  const instance = useDataTable({
    data,
    columns,
    filters,
    commands,
    rowCount,
    getRowId,
    isLoading,
    rowSelection,
    pagination: enablePagination ? { state: state.pagination, onPaginationChange: (pagination) => setState({ pagination }) } : undefined,
    search: enableSearch
      ? {
          state: state.search,
          onSearchChange: (search) => setState((current) => ({ ...current, search, pagination: { ...current.pagination, pageIndex: 0 } })),
        }
      : undefined,
    sorting: sortingEnabled
      ? {
          state: state.sorting,
          onSortingChange: (sorting) => setState((current) => ({ ...current, sorting, pagination: { ...current.pagination, pageIndex: 0 } })),
        }
      : undefined,
    filtering: filteringEnabled
      ? {
          state: state.filtering,
          onFilteringChange: (filtering) => setState((current) => ({ ...current, filtering, pagination: { ...current.pagination, pageIndex: 0 } })),
        }
      : undefined,
    columnVisibility: enableColumnVisibility
      ? { state: state.columnVisibility, onColumnVisibilityChange: (columnVisibility) => setState({ columnVisibility }) }
      : undefined,
    columnOrder: enableColumnVisibility ? { state: state.columnOrder, onColumnOrderChange: (columnOrder) => setState({ columnOrder }) } : undefined,
    onRowClick:
      rowHref || onRowClick
        ? (event, row) => {
            const target = event.target instanceof Element ? event.target : null;
            if (event.defaultPrevented || target?.closest('a, button, input, select, textarea, [role="button"], [role="checkbox"]')) return;
            if (onRowClick) {
              onRowClick(row);
              return;
            }
            const href = rowHref?.(row);
            if (!href) return;
            if ((event.metaKey || event.ctrlKey || event.shiftKey) && typeof window !== 'undefined') {
              window.open(href, '_blank', 'noopener,noreferrer');
              return;
            }
            navigate(href);
          }
        : undefined,
  });
  const toolbarTranslations = {
    clearAll: t('actions.clearAll'),
    sort: t('filters.sortLabel'),
    filter: t('filters.filterLabel'),
    columns: t('filters.columnsLabel'),
  };
  return (
    <UiDataTable instance={instance} className={`${layout === 'fill' ? 'flex h-full min-h-0 flex-col' : ''} ${className ?? ''}`}>
      <UiDataTable.Toolbar
        translations={toolbarTranslations}
        filterBarContent={filterBarContent}
        alwaysShowFilterBar={filteringEnabled}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex min-w-0 flex-wrap items-center gap-4">
          {(heading || subHeading) && (
            <div>
              {heading && <Heading level={headingLevel}>{heading}</Heading>}
              {subHeading && (
                <Text size="small" className="text-ui-fg-subtle">
                  {subHeading}
                </Text>
              )}
            </div>
          )}
          {views && <ViewPills {...views} />}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filteringEnabled && <UiDataTable.FilterMenu tooltip={toolbarTranslations.filter} />}
          {sortingEnabled && <UiDataTable.SortingMenu tooltip={toolbarTranslations.sort} />}
          {enableColumnVisibility && <UiDataTable.ColumnVisibilityMenu tooltip={toolbarTranslations.columns} />}
          {enableSearch && <UiDataTable.Search placeholder={t('filters.searchLabel')} autoFocus={autoFocusSearch} />}
          {actionMenu && <ActionMenu {...actionMenu} />}
          {(actions ?? (action ? [action] : [])).map((item, index) => (
            <DataTableAction key={index} {...item} />
          ))}
        </div>
      </UiDataTable.Toolbar>
      <UiDataTable.Table emptyState={emptyState} />
      {enablePagination && <LocalizedTablePagination />}
      {Boolean(commands?.length) && <UiDataTable.CommandBar selectedLabel={(count) => `${count} ${t('general.selected')}`} />}
    </UiDataTable>
  );
}
function DataTableAction({ label, disabled, tooltip, ...props }: DataTableActionProps) {
  const content =
    'to' in props && !disabled ? (
      <Button size="small" variant="secondary" asChild>
        <Link to={props.to}>{label}</Link>
      </Button>
    ) : (
      <Button type="button" size="small" variant="secondary" disabled={disabled} onClick={'onClick' in props ? props.onClick : undefined}>
        {label}
      </Button>
    );
  return tooltip ? <Tooltip content={tooltip}>{content}</Tooltip> : content;
}
export const DashboardDataTable = DataTable;
