import type { ScrollToOptions, Virtualizer } from '@tanstack/react-virtual';
import { type Dispatch, type SetStateAction, useCallback } from 'react';
import type { FieldValues } from 'react-hook-form';
import type { Column, Row, VisibilityState } from '../../../lib/table';
import type { DataGridMatrix, DataGridQueryTool } from '../models';
import type { DataGridCoordinates } from '../types';

type UseDataGridNavigationOptions<TData extends object, TFieldValues extends FieldValues> = {
  matrix: DataGridMatrix<TData, TFieldValues>;
  anchor: DataGridCoordinates | null;
  visibleRows: Row<TData>[];
  visibleColumns: Column<TData, unknown>[];
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
  columnVirtualizer: Virtualizer<HTMLDivElement, Element>;
  setColumnVisibility: Dispatch<SetStateAction<VisibilityState>>;
  flatRows: Row<TData>[];
  flatColumns: Column<TData, unknown>[];
  queryTool: DataGridQueryTool | null;
  setSingleRange: (coords: DataGridCoordinates | null) => void;
};

export const useDataGridNavigation = <TData extends object, TFieldValues extends FieldValues>({
  matrix,
  anchor,
  visibleColumns,
  visibleRows,
  columnVirtualizer,
  rowVirtualizer,
  setColumnVisibility,
  flatColumns,
  flatRows,
  queryTool,
  setSingleRange,
}: UseDataGridNavigationOptions<TData, TFieldValues>) => {
  const scrollToCoordinates = useCallback(
    (coords: DataGridCoordinates, direction: 'horizontal' | 'vertical' | 'both') => {
      if (!anchor) {
        return;
      }

      const { row, col } = coords;
      const { row: anchorRow, col: anchorCol } = anchor;

      const rowDirection = row >= anchorRow ? 'down' : 'up';
      const colDirection = col >= anchorCol ? 'right' : 'left';

      const visibleRow = visibleRows.findIndex((item) => item.id === flatRows[row]?.id);
      const visibleColumn = visibleColumns.findIndex((item) => item.id === flatColumns[col]?.id);
      const toRow = Math.max(0, Math.min(visibleRows.length - 1, visibleRow + (rowDirection === 'down' ? 1 : -1)));
      const toCol = Math.max(0, Math.min(visibleColumns.length - 1, visibleColumn + (colDirection === 'right' ? 1 : -1)));

      const scrollOptions: ScrollToOptions = { align: 'auto', behavior: 'auto' };

      if (visibleColumn >= 0 && (direction === 'horizontal' || direction === 'both')) {
        columnVirtualizer.scrollToIndex(toCol, scrollOptions);
      }

      if (visibleRow >= 0 && (direction === 'vertical' || direction === 'both')) {
        rowVirtualizer.scrollToIndex(toRow, scrollOptions);
      }
    },
    [anchor, columnVirtualizer, visibleRows, rowVirtualizer, visibleColumns, flatRows, flatColumns],
  );

  const navigateToField = useCallback(
    (field: string) => {
      const coords = matrix.getCoordinatesByField(field);

      if (!coords) {
        return;
      }

      const column = flatColumns[coords.col];

      // Ensure that the column is visible
      setColumnVisibility((prev) => ({
        ...prev,
        [column.id]: true,
      }));

      requestAnimationFrame(() => {
        scrollToCoordinates(coords, 'both');
        setSingleRange(coords);
      });

      requestAnimationFrame(() => {
        const input = queryTool?.getInput(coords);

        if (input) {
          input.focus();
        }
      });
    },
    [matrix, flatColumns, setColumnVisibility, scrollToCoordinates, setSingleRange, queryTool],
  );

  return {
    scrollToCoordinates,
    navigateToField,
  };
};
