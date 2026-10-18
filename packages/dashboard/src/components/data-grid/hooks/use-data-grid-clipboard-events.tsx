import { type RefObject, useCallback, useState } from 'react';
import type { FieldValues, Path, PathValue } from 'react-hook-form';
import { parseTsv, serializeTsv } from '../../../lib/clipboard';
import { DataGridBulkUpdateCommand, type DataGridMatrix } from '../models';
import type { DataGridCoordinates } from '../types';

type Options<TData extends object, TFields extends FieldValues> = {
  containerRef: RefObject<HTMLDivElement | null>;
  matrix: DataGridMatrix<TData, TFields>;
  isEditing: boolean;
  anchor: DataGridCoordinates | null;
  rangeEnd: DataGridCoordinates | null;
  getSelectionValues: (fields: string[]) => PathValue<TFields, Path<TFields>>[];
  setSelectionValues: (fields: string[], values: PathValue<TFields, Path<TFields>>[]) => void;
  execute: (command: DataGridBulkUpdateCommand) => void;
};
export function useDataGridClipboardEvents<TData extends object, TFields extends FieldValues>({
  containerRef,
  matrix,
  isEditing,
  anchor,
  rangeEnd,
  getSelectionValues,
  setSelectionValues,
  execute,
}: Options<TData, TFields>) {
  const [clipboardError, setClipboardError] = useState<string | null>(null);
  const handleCopyEvent = useCallback(
    (event: ClipboardEvent) => {
      const container = containerRef.current;
      if (isEditing || !anchor || !rangeEnd || event.defaultPrevented || !container?.contains(document.activeElement)) return;
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed && (!container.contains(selection.anchorNode) || !container.contains(selection.focusNode))) return;
      try {
        const rows: unknown[][] = [];
        for (let row = Math.min(anchor.row, rangeEnd.row); row <= Math.max(anchor.row, rangeEnd.row); row++) {
          const values: unknown[] = [];
          for (let col = Math.min(anchor.col, rangeEnd.col); col <= Math.max(anchor.col, rangeEnd.col); col++) {
            const field = matrix.getCellField({ row, col });
            values.push(field && matrix.getIsCellEnabled({ row, col }) ? getSelectionValues([field])[0] : '');
          }
          rows.push(values);
        }
        event.clipboardData?.setData('text/plain', serializeTsv(rows));
        event.preventDefault();
        setClipboardError(null);
      } catch (error) {
        setClipboardError(error instanceof Error ? error.message : 'Unable to copy cells.');
      }
    },
    [containerRef, isEditing, anchor, rangeEnd, matrix, getSelectionValues],
  );
  const handlePasteEvent = useCallback(
    (event: ClipboardEvent) => {
      if (
        isEditing ||
        !anchor ||
        !rangeEnd ||
        event.defaultPrevented ||
        !containerRef.current?.contains(document.activeElement) ||
        !event.clipboardData
      )
        return;
      event.preventDefault();
      try {
        const rows = parseTsv(event.clipboardData.getData('text/plain'));
        const width = Math.max(...rows.map((row) => row.length));
        const startRow = Math.min(anchor.row, rangeEnd.row);
        const startCol = Math.min(anchor.col, rangeEnd.col);
        const endRow = Math.max(anchor.row, rangeEnd.row, startRow + rows.length - 1);
        const endCol = matrix.supportsMultiColumnSelection ? Math.max(anchor.col, rangeEnd.col, startCol + width - 1) : startCol;
        const fields: string[] = [];
        const next: string[] = [];
        for (let row = startRow; row <= endRow; row++)
          for (let col = startCol; col <= endCol; col++) {
            const field = matrix.getCellField({ row, col });
            if (field && matrix.getIsCellEnabled({ row, col })) {
              fields.push(field);
              next.push(rows[(row - startRow) % rows.length][(col - startCol) % width] ?? '');
            }
          }
        const previous = getSelectionValues(fields);
        if (fields.length) execute(new DataGridBulkUpdateCommand({ fields, next, prev: previous, setter: setSelectionValues }));
        setClipboardError(null);
      } catch (error) {
        setClipboardError(error instanceof Error ? error.message : 'Unable to paste cells.');
      }
    },
    [containerRef, matrix, isEditing, anchor, rangeEnd, getSelectionValues, setSelectionValues, execute],
  );
  return { handleCopyEvent, handlePasteEvent, clipboardError };
}
