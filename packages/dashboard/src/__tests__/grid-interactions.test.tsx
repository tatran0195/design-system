import { act, renderHook } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { createDataGridHelper } from '../components/data-grid/helpers';
import { useDataGridClipboardEvents } from '../components/data-grid/hooks/use-data-grid-clipboard-events';
import { useDataGridFormHandlers } from '../components/data-grid/hooks/use-data-grid-form-handlers';
import { useDataGridKeydownEvent } from '../components/data-grid/hooks/use-data-grid-keydown-event';
import { useDataGridMouseUpEvent } from '../components/data-grid/hooks/use-data-grid-mouse-up-event';
import { useDataGridNavigation } from '../components/data-grid/hooks/use-data-grid-navigation';
import { DataGridMatrix } from '../components/data-grid/models';
import { parseTsv, serializeTsv } from '../lib/clipboard';
import { useDashboardGridTable } from '../lib/table';

type Fields = { rows: { title: string; amount: number | string }[] };
const data = [{ id: 'a' }, { id: 'b' }];
const helper = createDataGridHelper<{ id: string }, Fields>();
const columns = [
  helper.column({ id: 'title', header: 'Title', type: 'text', field: ({ row }) => `rows.${row.index}.title`, cell: () => null }),
  helper.column({ id: 'amount', header: 'Amount', type: 'number', field: ({ row }) => `rows.${row.index}.amount`, cell: () => null }),
];
function useGrid() {
  const form = useForm<Fields>({
    defaultValues: {
      rows: [
        { title: 'Alpha', amount: 2 },
        { title: 'Beta', amount: 3 },
      ],
    },
  });
  const table = useDashboardGridTable({ data, columns });
  const matrix = new DataGridMatrix<{ id: string }, Fields>(table.getRowModel().rows, columns, true);
  const handlers = useDataGridFormHandlers({ matrix, form, anchor: { row: 0, col: 0 } });
  return { form, matrix, ...handlers };
}
describe('grid commands, clipboard, and focus scope', () => {
  it('round-trips quoted TSV, embedded newlines, tabs, and Windows line endings', () => {
    const rows = [
      ['A\tB', 'line 1\nline 2', '"quote"'],
      ['', '1', ''],
    ];
    expect(parseTsv(serializeTsv(rows))).toEqual(rows);
    expect(parseTsv('A\t1\r\nB\t2\r\n')).toEqual([
      ['A', '1'],
      ['B', '2'],
    ]);
  });
  it('converts pasted values by each target column type and preserves dirty state', () => {
    const { result } = renderHook(useGrid);
    act(() => result.current.setSelectionValues(['rows.0.title', 'rows.0.amount'], ['Changed', '42']));
    expect(result.current.form.getValues('rows.0')).toEqual({ title: 'Changed', amount: 42 });
    expect(result.current.form.getFieldState('rows.0.amount').isDirty).toBe(true);
  });
  it('rejects invalid mixed-column paste atomically', () => {
    const { result } = renderHook(useGrid);
    expect(() => result.current.setSelectionValues(['rows.0.title', 'rows.0.amount'], ['Changed', 'not-a-number'])).toThrow('cannot be converted');
    expect(result.current.form.getValues('rows.0')).toEqual({ title: 'Alpha', amount: 2 });
  });
  it('ignores global keyboard commands while another control owns focus', () => {
    const undo = vi.fn();
    const container = document.createElement('div');
    const outside = document.createElement('input');
    document.body.append(container, outside);
    const { result } = renderHook(() => {
      const grid = useGrid();
      return useDataGridKeydownEvent({
        ...grid,
        containerRef: { current: container },
        anchor: { row: 0, col: 0 },
        rangeEnd: { row: 0, col: 0 },
        isEditing: false,
        undo,
        redo: vi.fn(),
        execute: vi.fn(),
        getValues: grid.form.getValues,
        setValue: grid.form.setValue,
        setTrapActive: vi.fn(),
        setSingleRange: vi.fn(),
        setRangeEnd: vi.fn(),
        onEditingChangeHandler: vi.fn(),
        scrollToCoordinates: vi.fn(),
        restoreSnapshot: vi.fn(),
        createSnapshot: vi.fn(),
        queryTool: null,
      });
    });
    outside.focus();
    act(() => result.current.handleKeyDownEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true })));
    expect(undo).not.toHaveBeenCalled();
    container.tabIndex = 0;
    container.focus();
    act(() => result.current.handleKeyDownEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true })));
    expect(undo).toHaveBeenCalledTimes(1);
    outside.remove();
    container.remove();
  });
  it('pastes and copies rectangular ranges and ignores paste outside the grid', () => {
    const container = document.createElement('div');
    container.tabIndex = 0;
    document.body.append(container);
    const executed = vi.fn((command) => command.execute());
    const { result } = renderHook(() => {
      const grid = useGrid();
      return {
        ...grid,
        clipboard: useDataGridClipboardEvents({
          ...grid,
          containerRef: { current: container },
          anchor: { row: 0, col: 0 },
          rangeEnd: { row: 1, col: 1 },
          isEditing: false,
          execute: executed,
        }),
      };
    });
    const setData = vi.fn();
    const event = {
      defaultPrevented: false,
      preventDefault: vi.fn(),
      clipboardData: { getData: () => 'First\t10\nSecond\t20', setData },
    } as unknown as ClipboardEvent;
    act(() => result.current.clipboard.handlePasteEvent(event));
    expect(executed).not.toHaveBeenCalled();
    container.focus();
    act(() => result.current.clipboard.handlePasteEvent(event));
    expect(result.current.form.getValues('rows')).toEqual([
      { title: 'First', amount: 10 },
      { title: 'Second', amount: 20 },
    ]);
    act(() => result.current.clipboard.handleCopyEvent(event));
    expect(setData).toHaveBeenCalledWith('text/plain', 'First\t10\nSecond\t20');
    container.remove();
  });
  it('maps flat row and column coordinates to visible virtual indexes after hiding', () => {
    const rows = ['a', 'b', 'c'].map((id) => ({ id }));
    const columns = ['a', 'b', 'c'].map((id) => ({ id }));
    const vertical = vi.fn();
    const horizontal = vi.fn();
    const { result } = renderHook(() =>
      useDataGridNavigation({
        matrix: {} as never,
        anchor: { row: 0, col: 0 },
        flatRows: rows as never,
        flatColumns: columns as never,
        visibleRows: rows.slice(1) as never,
        visibleColumns: [columns[0], columns[2]] as never,
        rowVirtualizer: { scrollToIndex: vertical } as never,
        columnVirtualizer: { scrollToIndex: horizontal } as never,
        queryTool: null,
        setColumnVisibility: vi.fn(),
        setSingleRange: vi.fn(),
      }),
    );
    act(() => result.current.scrollToCoordinates({ row: 2, col: 2 }, 'both'));
    expect(vertical).toHaveBeenCalledWith(1, expect.anything());
    expect(horizontal).toHaveBeenCalledWith(1, expect.anything());
  });
  it('fills a vertical range from its anchor as a reversible command', () => {
    const execute = vi.fn((command) => command.execute());
    const { result } = renderHook(() => {
      const grid = useGrid();
      const events = useDataGridMouseUpEvent({
        ...grid,
        isDragging: true,
        anchor: { row: 0, col: 0 },
        dragEnd: { row: 1, col: 0 },
        setDragEnd: vi.fn(),
        setRangeEnd: vi.fn(),
        setIsSelecting: vi.fn(),
        setIsDragging: vi.fn(),
        execute,
      });
      return { ...grid, ...events };
    });
    act(() => result.current.handleMouseUpEvent());
    expect(result.current.form.getValues('rows.1.title')).toBe('Alpha');
    act(() => execute.mock.calls[0]![0].undo());
    expect(result.current.form.getValues('rows.1.title')).toBe('Beta');
  });
});
