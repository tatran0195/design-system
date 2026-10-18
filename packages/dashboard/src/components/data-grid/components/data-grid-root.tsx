import { Adjustments, AdjustmentsDone, ExclamationCircle } from '@cms/icons';
import { Button, clx, DropdownMenu } from '@cms/ui';
import { useVirtualizer, type VirtualItem, type Virtualizer } from '@tanstack/react-virtual';
import React, { type CSSProperties, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import { useCommandHistory } from '../../../hooks/use-command-history';
import { useDocumentDirection } from '../../../hooks/use-document-direction';
import { useTranslation } from '../../../i18n';
import {
  type Cell,
  type CellContext,
  type Column,
  type ColumnDef,
  flexRender,
  type Row,
  useDashboardGridTable as useReactTable,
  type VisibilityState,
} from '../../../lib/table';
import { ConditionalTooltip } from '../../common/conditional-tooltip';
import { DataGridContext, type DataGridContextType } from '../context';
import {
  useDataGridCellHandlers,
  useDataGridCellMetadata,
  useDataGridCellSnapshot,
  useDataGridClipboardEvents,
  useDataGridColumnVisibility,
  useDataGridErrorHighlighting,
  useDataGridFormHandlers,
  useDataGridKeydownEvent,
  useDataGridMouseUpEvent,
  useDataGridNavigation,
  useDataGridQueryTool,
} from '../hooks';
import { DataGridMatrix } from '../models';
import type { DataGridCoordinates, GridColumnOption } from '../types';
import { isCellMatch, isSpecialFocusKey } from '../utils';
import { DataGridKeyboardShortcutModal } from './data-grid-keyboard-shortcut-modal';
export interface DataGridRootProps<TData extends object, TFieldValues extends FieldValues = FieldValues> {
  data?: TData[];
  columns: ColumnDef<TData>[];
  state: UseFormReturn<TFieldValues>;
  getSubRows?: (row: TData) => TData[] | undefined;
  onEditingChange?: (isEditing: boolean) => void;
  disableInteractions?: boolean;
  multiColumnSelection?: boolean;
  showColumnsDropdown?: boolean;
  /**
   * Custom content to render in the header, positioned between the column visibility
   * controls and the error/shortcuts section.
   */
  ariaLabel?: string;
  headerContent?: ReactNode;
  /**
   * Lazy loading props - when totalRowCount is provided, the grid enters lazy loading mode.
   * In this mode, the virtualizer will size based on totalRowCount and trigger onFetchMore
   * when the user scrolls near the end of loaded data.
   */
  /** Total count of rows for scroll sizing (enables lazy loading mode when provided) */
  totalRowCount?: number;
  /** Called when more data should be fetched */
  onFetchMore?: () => void;
  /** Whether more data is currently being fetched */
  isFetchingMore?: boolean;
  /** Whether there is more data to fetch */
  hasNextPage?: boolean;
}

const ROW_HEIGHT = 40;

const getCommonPinningStyles = <TData extends object>(column: Column<TData>): CSSProperties => {
  const isPinned = column.getIsPinned();

  /**
   * Since our border colors are semi-transparent, we need to set a custom border color
   * that looks the same as the actual border color, but has 100% opacity.
   *
   * We do this by checking if the current theme is dark mode, and then setting the border color
   * to the corresponding color.
   */
  const BORDER_COLOR = 'var(--docs-border-base, currentColor)';

  return {
    position: isPinned ? 'sticky' : 'relative',
    width: column.getSize(),
    zIndex: isPinned ? 1 : 0,
    borderBottom: isPinned ? `1px solid ${BORDER_COLOR}` : undefined,
    borderRight: isPinned ? `1px solid ${BORDER_COLOR}` : undefined,
    insetInlineStart: isPinned === 'start' ? `${column.getStart('start')}px` : undefined,
    insetInlineEnd: isPinned === 'end' ? `${column.getAfter('end')}px` : undefined,
  };
};

/**
 * TODO:
 * - [Minor] Extend the commands to also support modifying the anchor and rangeEnd, to restore the previous focus after undo/redo.
 */

export const DataGridRoot = <TData extends object, TFieldValues extends FieldValues = FieldValues>({
  data = [],
  columns,
  state,
  getSubRows,
  onEditingChange,
  disableInteractions,
  multiColumnSelection = false,
  showColumnsDropdown = true,
  totalRowCount,
  onFetchMore,
  isFetchingMore,
  hasNextPage,
  headerContent,
  ariaLabel = 'Editable data grid',
}: DataGridRootProps<TData, TFieldValues>) => {
  // TODO: remove once everything is lazy loaded
  const isLazyMode = totalRowCount !== undefined;
  const containerRef = useRef<HTMLDivElement>(null);
  const direction = useDocumentDirection() ?? 'ltr';

  const { redo, undo, execute } = useCommandHistory();
  const {
    register,
    control,
    getValues,
    setValue,
    formState: { errors },
  } = state;

  const [internalTrapActive, setTrapActive] = useState(true);

  const trapActive = !disableInteractions && internalTrapActive;

  const [anchor, setAnchor] = useState<DataGridCoordinates | null>(null);
  const [rangeEnd, setRangeEnd] = useState<DataGridCoordinates | null>(null);
  const [dragEnd, setDragEnd] = useState<DataGridCoordinates | null>(null);

  const [isSelecting, setIsSelecting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowVisibility, setRowVisibility] = useState<VisibilityState>({});

  const grid = useReactTable<TData>({
    data,
    columns,
    initialState: {
      columnPinning: {
        start: columns[0]?.id ? [columns[0].id] : [],
        end: [],
      },
    },
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    getSubRows,
    columnResizeMode: 'onChange',
    columnResizeDirection: direction,
    defaultColumn: {
      size: 200,
      maxSize: 400,
    },
  });

  const { flatRows } = grid.getRowModel();
  const flatColumns = grid.getAllFlatColumns();

  const visibleRows = useMemo(() => flatRows.filter((_, index) => rowVisibility?.[index] !== false), [flatRows, rowVisibility]);
  const visibleColumns = grid.getVisibleLeafColumns();

  const effectiveRowCount = isLazyMode ? totalRowCount! : visibleRows.length;

  const rowVirtualizer = useVirtualizer({
    count: effectiveRowCount,
    estimateSize: () => ROW_HEIGHT,
    getScrollElement: () => containerRef.current,
    // Measure actual row heights for dynamic sizing (disabled in Firefox due to measurement issues). Taken from Tanstack
    measureElement:
      typeof window !== 'undefined' && typeof navigator !== 'undefined' && navigator.userAgent.indexOf('Firefox') === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
    rangeExtractor: (range) => {
      const toRender = new Set(Array.from({ length: range.endIndex - range.startIndex + 1 }, (_, i) => range.startIndex + i));

      for (const coords of [anchor, rangeEnd]) {
        const index = coords ? visibleRows.findIndex((row) => row.id === flatRows[coords.row]?.id) : -1;
        if (index >= 0) toRender.add(index);
      }

      return Array.from(toRender).sort((a, b) => a - b);
    },
  });
  const virtualRows = rowVirtualizer.getVirtualItems();

  /**
   * Lazy loading scroll detection.
   * When the user scrolls near the end of loaded data, trigger onFetchMore.
   * We use refs to get latest values in the scroll handler without re-attaching.
   */
  const lazyLoadingRefs = useRef({
    onFetchMore,
    hasNextPage,
    isFetchingMore,
    loadedRowCount: visibleRows.length,
  });

  // Keep refs updated
  useEffect(() => {
    lazyLoadingRefs.current = {
      onFetchMore,
      hasNextPage,
      isFetchingMore,
      loadedRowCount: visibleRows.length,
    };
  }, [onFetchMore, hasNextPage, isFetchingMore, visibleRows.length]);

  const hasData = visibleRows.length > 0;

  const handleScroll = useCallback(() => {
    const { onFetchMore, hasNextPage, isFetchingMore, loadedRowCount } = lazyLoadingRefs.current;

    if (!onFetchMore || !hasNextPage || isFetchingMore) {
      return;
    }

    const scrollElement = containerRef.current;

    const { scrollTop, clientHeight } = scrollElement!;
    const loadedHeight = loadedRowCount * ROW_HEIGHT;
    const viewportBottom = scrollTop + clientHeight;
    const fetchThreshold = loadedHeight - ROW_HEIGHT * 10;

    if (viewportBottom >= fetchThreshold) {
      onFetchMore();
    }
  }, [lazyLoadingRefs, containerRef]);

  useEffect(() => {
    if (!isLazyMode || !hasData) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const timeoutId = setTimeout(() => {
      const scrollElement: HTMLElement | null = containerRef.current;
      if (!scrollElement) {
        return;
      }

      scrollElement.addEventListener('scroll', handleScroll);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      const scrollElement = containerRef.current;
      scrollElement?.removeEventListener('scroll', handleScroll);
    };
  }, [isLazyMode, hasData]);

  const columnVirtualizer = useVirtualizer({
    count: visibleColumns.length,
    estimateSize: (index) => visibleColumns[index].getSize(),
    getScrollElement: () => containerRef.current,
    horizontal: true,
    isRtl: direction === 'rtl',
    overscan: 3,
    rangeExtractor: (range) => {
      const startIndex = range.startIndex;
      const endIndex = range.endIndex;

      const toRender = new Set(Array.from({ length: endIndex - startIndex + 1 }, (_, i) => startIndex + i));

      for (const coords of [anchor, rangeEnd]) {
        const index = coords ? visibleColumns.findIndex((column) => column.id === flatColumns[coords.col]?.id) : -1;
        if (index >= 0) toRender.add(index);
      }

      // The first column is pinned, so we always render it
      if (visibleColumns.length) toRender.add(0);

      return Array.from(toRender).sort((a, b) => a - b);
    },
  });
  const virtualColumns = columnVirtualizer.getVirtualItems();

  // The column virtualizer caches sizes from getSize(); re-measure when a resize changes them.
  const columnSizing = grid.state.columnSizing;
  useEffect(() => {
    columnVirtualizer.measure();
  }, [columnSizing, columnVirtualizer]);

  let virtualPaddingLeft: number | undefined;
  let virtualPaddingRight: number | undefined;

  if (columnVirtualizer && virtualColumns?.length) {
    virtualPaddingLeft = virtualColumns[0]?.start ?? 0;
    virtualPaddingRight = columnVirtualizer.getTotalSize() - (virtualColumns[virtualColumns.length - 1]?.end ?? 0);
  }

  const matrix = useMemo(() => {
    const matrix = new DataGridMatrix<TData, TFieldValues>(flatRows, columns, multiColumnSelection);
    columns.forEach((column, index) => matrix.toggleColumn(index, columnVisibility[column.id ?? ''] !== false));
    flatRows.forEach((_, index) => matrix.toggleRow(index, rowVisibility[index] !== false));
    return matrix;
  }, [flatRows, columns, multiColumnSelection, columnVisibility, rowVisibility]);
  const queryTool = useDataGridQueryTool(containerRef);

  const setSingleRange = useCallback((coordinates: DataGridCoordinates | null) => {
    setAnchor(coordinates);
    setRangeEnd(coordinates);
  }, []);

  const { errorCount, isHighlighted, toggleErrorHighlighting } = useDataGridErrorHighlighting(matrix, grid, errors);

  const handleToggleErrorHighlighting = useCallback(() => {
    toggleErrorHighlighting(rowVisibility, columnVisibility, setRowVisibility, setColumnVisibility);
  }, [toggleErrorHighlighting, rowVisibility, columnVisibility]);

  const { columnOptions, handleToggleColumn, handleResetColumns, isDisabled: isColumsDisabled } = useDataGridColumnVisibility(grid, matrix);

  const handleToggleColumnVisibility = useCallback((index: number) => handleToggleColumn(index), [handleToggleColumn]);

  const { navigateToField, scrollToCoordinates } = useDataGridNavigation<TData, TFieldValues>({
    matrix,
    queryTool,
    anchor,
    columnVirtualizer,
    rowVirtualizer,
    flatColumns,
    flatRows,
    setColumnVisibility,
    setSingleRange,
    visibleColumns,
    visibleRows,
  });

  const { createSnapshot, restoreSnapshot } = useDataGridCellSnapshot<TData, TFieldValues>({
    matrix,
    form: state,
  });

  const onEditingChangeHandler = useCallback(
    (value: boolean) => {
      if (onEditingChange) {
        onEditingChange(value);
      }

      if (value) {
        createSnapshot(anchor);
      }

      setIsEditing(value);
    },
    [anchor, createSnapshot, onEditingChange],
  );

  const { getSelectionValues, setSelectionValues } = useDataGridFormHandlers<TData, TFieldValues>({
    matrix,
    form: state,
    anchor,
  });

  const { handleKeyDownEvent, handleSpecialFocusKeys } = useDataGridKeydownEvent<TData, TFieldValues>({
    containerRef,
    direction,
    matrix,
    queryTool,
    anchor,
    rangeEnd,
    isEditing,
    setTrapActive,
    setRangeEnd,
    getSelectionValues,
    getValues,
    setSelectionValues,
    onEditingChangeHandler,
    restoreSnapshot,
    createSnapshot,
    setSingleRange,
    scrollToCoordinates,
    execute,
    undo,
    redo,
    setValue,
  });

  const { handleMouseUpEvent } = useDataGridMouseUpEvent<TData, TFieldValues>({
    matrix,
    anchor,
    dragEnd,
    setDragEnd,
    isDragging,
    setIsDragging,
    setRangeEnd,
    setIsSelecting,
    getSelectionValues,
    setSelectionValues,
    execute,
  });

  const { handleCopyEvent, handlePasteEvent, clipboardError } = useDataGridClipboardEvents<TData, TFieldValues>({
    containerRef,
    matrix,
    isEditing,
    anchor,
    rangeEnd,
    getSelectionValues,
    setSelectionValues,
    execute,
  });

  const {
    getWrapperFocusHandler,
    getInputChangeHandler,
    getOverlayMouseDownHandler,
    getWrapperMouseOverHandler,
    getIsCellDragSelected,
    getIsCellSelected,
    onDragToFillStart,
  } = useDataGridCellHandlers<TData, TFieldValues>({
    matrix,
    anchor,
    rangeEnd,
    setRangeEnd,
    isDragging,
    setIsDragging,
    isSelecting,
    setIsSelecting,
    setSingleRange,
    dragEnd,
    setDragEnd,
    setValue,
    execute,
    multiColumnSelection,
  });

  const { getCellErrorMetadata, getCellMetadata } = useDataGridCellMetadata<TData, TFieldValues>({
    matrix,
  });

  /** Effects */

  /**
   * Register all handlers for the grid.
   */
  useEffect(() => {
    if (!trapActive) {
      return;
    }

    window.addEventListener('keydown', handleKeyDownEvent);
    window.addEventListener('mouseup', handleMouseUpEvent);

    // Copy and paste event listeners need to be added to the window
    window.addEventListener('copy', handleCopyEvent);
    window.addEventListener('paste', handlePasteEvent);

    return () => {
      window.removeEventListener('keydown', handleKeyDownEvent);
      window.removeEventListener('mouseup', handleMouseUpEvent);

      window.removeEventListener('copy', handleCopyEvent);
      window.removeEventListener('paste', handlePasteEvent);
    };
  }, [trapActive, handleKeyDownEvent, handleMouseUpEvent, handleCopyEvent, handlePasteEvent]);

  useEffect(() => {
    const specialFocusHandler = (e: KeyboardEvent) => {
      if (
        !disableInteractions &&
        !e.defaultPrevented &&
        !e.isComposing &&
        containerRef.current?.contains(document.activeElement) &&
        isSpecialFocusKey(e)
      ) {
        handleSpecialFocusKeys(e);
      }
    };

    window.addEventListener('keydown', specialFocusHandler);

    return () => {
      window.removeEventListener('keydown', specialFocusHandler);
    };
  }, [handleSpecialFocusKeys, disableInteractions]);

  const handleHeaderInteractionChange = useCallback((isActive: boolean) => {
    if (isActive) {
      setTrapActive(false);
    }
  }, []);

  /**
   * Auto corrective effect for ensuring we always
   * have a range end.
   */
  useEffect(() => {
    if (!anchor) {
      return;
    }

    if (rangeEnd) {
      return;
    }

    setRangeEnd(anchor);
  }, [anchor, rangeEnd]);

  /**
   * Ensure that we set a anchor on first render.
   */
  useEffect(() => {
    if (!anchor || !matrix.getIsCellEnabled(anchor)) {
      const coords = matrix.getFirstNavigableCell();

      setSingleRange(coords);
    }
  }, [anchor, matrix, setSingleRange]);

  const values = useMemo(
    () => ({
      anchor,
      control,
      trapActive,
      disabled: Boolean(disableInteractions),
      gridRef: containerRef,
      errors,
      setTrapActive,
      setIsSelecting,
      setIsEditing: onEditingChangeHandler,
      setSingleRange,
      setRangeEnd,
      getWrapperFocusHandler,
      getInputChangeHandler,
      getOverlayMouseDownHandler,
      getWrapperMouseOverHandler,
      register,
      getIsCellSelected,
      getIsCellDragSelected,
      getCellMetadata,
      getCellErrorMetadata,
      navigateToField,
    }),
    [
      anchor,
      control,
      trapActive,
      disableInteractions,
      errors,
      setTrapActive,
      setIsSelecting,
      onEditingChangeHandler,
      setSingleRange,
      setRangeEnd,
      getWrapperFocusHandler,
      getInputChangeHandler,
      getOverlayMouseDownHandler,
      getWrapperMouseOverHandler,
      register,
      getIsCellSelected,
      getIsCellDragSelected,
      getCellMetadata,
      getCellErrorMetadata,
      navigateToField,
    ],
  );

  const handleRestoreGridFocus = useCallback(() => {
    if (!disableInteractions && anchor && !trapActive) {
      setTrapActive(true);

      setSingleRange(anchor);
      scrollToCoordinates(anchor, 'both');

      requestAnimationFrame(() => {
        queryTool?.getContainer(anchor)?.focus();
      });
    }
  }, [disableInteractions, anchor, trapActive, setSingleRange, scrollToCoordinates, queryTool]);

  return (
    <DataGridContext.Provider value={values as DataGridContextType<any>}>
      <div className="bg-ui-bg-subtle flex size-full flex-col">
        <DataGridHeader
          showColumnsDropdown={showColumnsDropdown}
          columnOptions={columnOptions}
          isDisabled={isColumsDisabled}
          onToggleColumn={handleToggleColumnVisibility}
          errorCount={errorCount}
          onToggleErrorHighlighting={handleToggleErrorHighlighting}
          onResetColumns={handleResetColumns}
          isHighlighted={isHighlighted}
          onHeaderInteractionChange={handleHeaderInteractionChange}
          headerContent={headerContent}
        />
        {clipboardError && (
          <p role="alert" className="text-ui-fg-error px-4 py-2">
            {clipboardError}
          </p>
        )}
        <div className="size-full overflow-hidden">
          <div
            ref={containerRef}
            autoFocus
            tabIndex={disableInteractions ? -1 : 0}
            className="relative isolate h-full select-none overflow-auto outline-none"
            onFocus={handleRestoreGridFocus}
            onClick={handleRestoreGridFocus}
            data-container={true}
            role="application"
            aria-label={ariaLabel}
            aria-disabled={disableInteractions || undefined}
          >
            <div
              role="grid"
              aria-label={ariaLabel}
              aria-readonly={disableInteractions || undefined}
              aria-rowcount={effectiveRowCount + 1}
              aria-colcount={visibleColumns.length}
              className="text-ui-fg-subtle grid"
            >
              <div role="rowgroup" className="txt-compact-small-plus bg-ui-bg-subtle sticky top-0 z-ui-sticky grid">
                {grid.getHeaderGroups().map((headerGroup) => (
                  <div role="row" key={headerGroup.id} className="flex h-10 w-full">
                    {virtualPaddingLeft ? <div role="presentation" style={{ display: 'flex', width: virtualPaddingLeft }} /> : null}
                    {virtualColumns.reduce((acc, vc, index, array) => {
                      const header = headerGroup.headers[vc.index];
                      const previousVC = array[index - 1];

                      if (previousVC && vc.index !== previousVC.index + 1) {
                        // If there's a gap between the current and previous virtual columns
                        acc.push(
                          <div
                            key={`padding-${previousVC.index}-${vc.index}`}
                            role="presentation"
                            style={{
                              display: 'flex',
                              width: `${vc.start - previousVC.end}px`,
                            }}
                          />,
                        );
                      }

                      acc.push(
                        <div
                          key={header.id}
                          role="columnheader"
                          aria-colindex={vc.index + 1}
                          data-column-index={vc.index}
                          style={{
                            width: header.getSize(),
                            ...getCommonPinningStyles(header.column),
                          }}
                          className="bg-ui-bg-base txt-compact-small-plus flex items-center border-b border-r px-4 py-2.5"
                        >
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanResize() && (
                            <div
                              onMouseDown={header.getResizeHandler()}
                              onTouchStart={header.getResizeHandler()}
                              onClick={(e) => e.stopPropagation()}
                              className={clx(
                                'hover:bg-ui-fg-interactive absolute end-0 top-0 z-[2] h-full w-1 cursor-col-resize touch-none select-none',
                                {
                                  'bg-ui-fg-interactive': header.column.getIsResizing(),
                                },
                              )}
                            />
                          )}
                        </div>,
                      );

                      return acc;
                    }, [] as ReactNode[])}
                    {virtualPaddingRight ? (
                      <div
                        role="presentation"
                        style={{
                          display: 'flex',
                          width: virtualPaddingRight,
                        }}
                      />
                    ) : null}
                  </div>
                ))}
              </div>
              <div
                role="rowgroup"
                className="relative grid"
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                }}
              >
                {virtualRows.map((virtualRow) => {
                  const row = visibleRows[virtualRow.index] as Row<TData>;

                  // In lazy mode, rows beyond loaded data show as skeleton
                  if (!row) {
                    return (
                      <DataGridRowSkeleton
                        key={`skeleton-${virtualRow.index}`}
                        virtualRow={virtualRow}
                        virtualColumns={virtualColumns}
                        virtualPaddingLeft={virtualPaddingLeft}
                        virtualPaddingRight={virtualPaddingRight}
                      />
                    );
                  }

                  const rowIndex = flatRows.findIndex((r) => r.id === row.id);

                  return (
                    <DataGridRow
                      key={row.id}
                      row={row}
                      rowIndex={rowIndex}
                      virtualRow={virtualRow}
                      rowVirtualizer={rowVirtualizer}
                      flatColumns={flatColumns}
                      virtualColumns={virtualColumns}
                      anchor={anchor}
                      virtualPaddingLeft={virtualPaddingLeft}
                      virtualPaddingRight={virtualPaddingRight}
                      onDragToFillStart={disableInteractions ? () => {} : onDragToFillStart}
                      multiColumnSelection={multiColumnSelection}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DataGridContext.Provider>
  );
};

type DataGridHeaderProps = {
  columnOptions: GridColumnOption[];
  isDisabled: boolean;
  showColumnsDropdown: boolean;
  onToggleColumn: (index: number) => (value: boolean) => void;
  onResetColumns: () => void;
  isHighlighted: boolean;
  errorCount: number;
  onToggleErrorHighlighting: () => void;
  onHeaderInteractionChange: (isActive: boolean) => void;
  headerContent?: ReactNode;
};

const DataGridHeader = ({
  columnOptions,
  isDisabled,
  onToggleColumn,
  onResetColumns,
  isHighlighted,
  errorCount,
  onToggleErrorHighlighting,
  onHeaderInteractionChange,
  showColumnsDropdown,
  headerContent,
}: DataGridHeaderProps) => {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const { t } = useTranslation();
  const direction = useDocumentDirection();

  // Since all columns are checked by default, we can check if any column is unchecked
  const hasChanged = columnOptions.some((column) => !column.checked);

  const handleShortcutsOpenChange = (value: boolean) => {
    onHeaderInteractionChange(value);
    setShortcutsOpen(value);
  };

  const handleColumnsOpenChange = (value: boolean) => {
    onHeaderInteractionChange(value);
    setColumnsOpen(value);
  };
  return (
    <div className="bg-ui-bg-base flex items-center justify-between border-b p-4">
      {showColumnsDropdown && (
        <div className="flex items-center gap-x-2">
          <DropdownMenu dir={direction} open={columnsOpen} onOpenChange={handleColumnsOpenChange}>
            <ConditionalTooltip showTooltip={isDisabled} content={t('dataGrid.columns.disabled')}>
              <DropdownMenu.Trigger asChild disabled={isDisabled}>
                <Button size="small" variant="secondary">
                  {hasChanged ? <AdjustmentsDone /> : <Adjustments />}
                  {t('dataGrid.columns.view')}
                </Button>
              </DropdownMenu.Trigger>
            </ConditionalTooltip>
            <DropdownMenu.Content>
              {columnOptions.map((column, index) => {
                const { checked, disabled, id, name } = column;

                if (disabled) {
                  return null;
                }

                return (
                  <DropdownMenu.CheckboxItem key={id} checked={checked} onCheckedChange={onToggleColumn(index)} onSelect={(e) => e.preventDefault()}>
                    {name}
                  </DropdownMenu.CheckboxItem>
                );
              })}
            </DropdownMenu.Content>
          </DropdownMenu>
          {hasChanged && (
            <Button
              size="small"
              variant="transparent"
              type="button"
              onClick={onResetColumns}
              className="text-ui-fg-muted hover:text-ui-fg-subtle"
              data-id="reset-columns"
            >
              {t('dataGrid.columns.resetToDefault')}
            </Button>
          )}
        </div>
      )}
      {headerContent}
      <div className="ml-auto flex items-center gap-x-2">
        {errorCount > 0 && (
          <Button
            size="small"
            variant="secondary"
            type="button"
            onClick={onToggleErrorHighlighting}
            className={clx({
              'bg-ui-button-neutral-pressed': isHighlighted,
            })}
          >
            <ExclamationCircle className="text-ui-fg-subtle" />
            <span>
              {t('dataGrid.errors.count', {
                count: errorCount,
              })}
            </span>
          </Button>
        )}
        <DataGridKeyboardShortcutModal open={shortcutsOpen} onOpenChange={handleShortcutsOpenChange} />
      </div>
    </div>
  );
};

type DataGridCellProps<TData extends object> = {
  cell: Cell<TData, unknown>;
  ariaColumnIndex: number;
  columnIndex: number;
  rowIndex: number;
  anchor: DataGridCoordinates | null;
  onDragToFillStart: (e: React.MouseEvent<HTMLElement>) => void;
  multiColumnSelection: boolean;
};

const DataGridCell = <TData extends object>({
  cell,
  ariaColumnIndex,
  columnIndex,
  rowIndex,
  anchor,
  onDragToFillStart,
  multiColumnSelection,
}: DataGridCellProps<TData>) => {
  const coords: DataGridCoordinates = {
    row: rowIndex,
    col: columnIndex,
  };

  const isAnchor = isCellMatch(coords, anchor);

  return (
    <div
      role="gridcell"
      aria-colindex={ariaColumnIndex}
      style={{
        width: cell.column.getSize(),
        ...getCommonPinningStyles(cell.column),
      }}
      data-row-index={rowIndex}
      data-column-index={columnIndex}
      className={clx('relative flex items-stretch border-b border-r p-0 outline-none')}
      tabIndex={-1}
    >
      <div className="relative w-full">
        {flexRender(cell.column.columnDef.cell, {
          ...cell.getContext(),
          columnIndex,
          rowIndex,
        } as CellContext<TData, any>)}
        {isAnchor && (
          <div
            onMouseDown={onDragToFillStart}
            className={clx('bg-ui-fg-interactive absolute bottom-0 right-0 z-[3] size-1.5 cursor-ns-resize', {
              'cursor-nwse-resize': multiColumnSelection,
            })}
          />
        )}
      </div>
    </div>
  );
};

type DataGridRowProps<TData extends object> = {
  row: Row<TData>;
  rowIndex: number;
  virtualRow: VirtualItem;
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
  virtualPaddingLeft?: number;
  virtualPaddingRight?: number;
  virtualColumns: VirtualItem[];
  flatColumns: Column<TData, unknown>[];
  anchor: DataGridCoordinates | null;
  onDragToFillStart: (e: React.MouseEvent<HTMLElement>) => void;
  multiColumnSelection: boolean;
};

const DataGridRow = <TData extends object>({
  row,
  rowIndex,
  virtualRow,
  rowVirtualizer,
  virtualPaddingLeft,
  virtualPaddingRight,
  virtualColumns,
  flatColumns,
  anchor,
  onDragToFillStart,
  multiColumnSelection,
}: DataGridRowProps<TData>) => {
  const visibleCells = row.getVisibleCells();

  return (
    <div
      role="row"
      aria-rowindex={virtualRow.index + 2}
      data-index={virtualRow.index}
      ref={(node) => rowVirtualizer.measureElement(node)}
      style={{
        transform: `translateY(${virtualRow.start}px)`,
      }}
      className="bg-ui-bg-subtle txt-compact-small absolute flex min-h-10 w-full"
    >
      {virtualPaddingLeft ? <div role="presentation" style={{ display: 'flex', width: virtualPaddingLeft }} /> : null}
      {virtualColumns.reduce((acc, vc, index, array) => {
        const cell = visibleCells[vc.index];
        const column = cell.column;
        const columnIndex = flatColumns.findIndex((c) => c.id === column.id);
        const previousVC = array[index - 1];

        if (previousVC && vc.index !== previousVC.index + 1) {
          // If there's a gap between the current and previous virtual columns
          acc.push(
            <div
              key={`padding-${previousVC.index}-${vc.index}`}
              role="presentation"
              style={{
                display: 'flex',
                width: `${vc.start - previousVC.end}px`,
              }}
            />,
          );
        }

        acc.push(
          <DataGridCell
            key={cell.id}
            cell={cell}
            ariaColumnIndex={vc.index + 1}
            columnIndex={columnIndex}
            rowIndex={rowIndex}
            anchor={anchor}
            onDragToFillStart={onDragToFillStart}
            multiColumnSelection={multiColumnSelection}
          />,
        );

        return acc;
      }, [] as ReactNode[])}
      {virtualPaddingRight ? <div role="presentation" style={{ display: 'flex', width: virtualPaddingRight }} /> : null}
    </div>
  );
};

/**
 * Skeleton row component for lazy loading.
 * Displays placeholder cells while data is being fetched.
 */
type DataGridRowSkeletonProps = {
  virtualRow: VirtualItem;
  virtualPaddingLeft?: number;
  virtualPaddingRight?: number;
  virtualColumns: VirtualItem[];
};

const DataGridRowSkeleton = ({ virtualRow, virtualPaddingLeft, virtualPaddingRight, virtualColumns }: DataGridRowSkeletonProps) => (
  <div
    role="row"
    aria-rowindex={virtualRow.index + 2}
    style={{
      transform: `translateY(${virtualRow.start}px)`,
    }}
    className="bg-ui-bg-subtle txt-compact-small absolute flex h-10 w-full"
  >
    {virtualPaddingLeft ? <div role="presentation" style={{ display: 'flex', width: virtualPaddingLeft }} /> : null}
    {virtualColumns.map((vc, index, array) => {
      const previousVC = array[index - 1];
      const elements: ReactNode[] = [];

      if (previousVC && vc.index !== previousVC.index + 1) {
        elements.push(
          <div
            key={`padding-${previousVC.index}-${vc.index}`}
            role="presentation"
            style={{
              display: 'flex',
              width: `${vc.start - previousVC.end}px`,
            }}
          />,
        );
      }

      elements.push(
        <div
          key={`skeleton-cell-${vc.index}`}
          role="gridcell"
          style={{ width: vc.size }}
          className="relative flex items-center border-b border-r p-0 outline-none"
        >
          <div className="flex h-full w-full items-center px-4">
            <div className="bg-ui-bg-component h-4 w-3/4 animate-pulse rounded" />
          </div>
        </div>,
      );

      return elements;
    })}
    {virtualPaddingRight ? <div role="presentation" style={{ display: 'flex', width: virtualPaddingRight }} /> : null}
  </div>
);
