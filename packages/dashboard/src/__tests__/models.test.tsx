import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { buildTree, flattenTree } from '../components/common/sortable-tree/utils';
import { createDataGridHelper } from '../components/data-grid/helpers';
import { DataGridBulkUpdateCommand, DataGridMatrix, DataGridQueryTool, DataGridUpdateCommand } from '../components/data-grid/models';
import { buildCoreEntries, buildDisplayEntries } from '../components/layout-composer/entries';
import { LayoutEntry } from '../components/layout-composer/entry';
import { createDashboardTranslator } from '../i18n';
import { getCurrencyInfo } from '../lib/data/currencies';
import { getOrderPaymentStatus } from '../lib/order-helpers';
import { useDashboardGridTable } from '../lib/table';

type Row = { id: string; title: string; amount: number };
type Fields = { rows: { title: string; amount: number }[] };
const rows: Row[] = [
  { id: 'a', title: 'Alpha', amount: 2 },
  { id: 'b', title: 'Beta', amount: 3 },
];
const helper = createDataGridHelper<Row, Fields>();
const columns = [
  helper.column({ id: 'title', header: 'Title', cell: () => null, type: 'text', field: ({ row }) => `rows.${row.index}.title` }),
  helper.column({ id: 'amount', header: 'Amount', cell: () => null, type: 'number', field: ({ row }) => `rows.${row.index}.amount` }),
];
function matrix(data = rows) {
  const { result } = renderHook(() => useDashboardGridTable({ data, columns }));
  return new DataGridMatrix<Row, Fields>(result.current.getRowModel().rows, columns, true);
}
describe('grid and composition models', () => {
  it('uses the same TanStack v9 dependency with typed fields, ranges, and movement', () => {
    const grid = matrix();
    expect(grid.getFirstNavigableCell()).toEqual({ row: 0, col: 0 });
    expect(grid.getFieldsInSelection({ row: 0, col: 0 }, { row: 1, col: 1 })).toEqual([
      'rows.0.title',
      'rows.0.amount',
      'rows.1.title',
      'rows.1.amount',
    ]);
    expect(grid.getValidMovement(0, 0, 'ArrowDown')).toEqual({ row: 1, col: 0 });
    expect(grid.getCoordinatesByField('rows.1.amount')).toEqual({ row: 1, col: 1 });
  });
  it('skips disabled cells including modifier-key navigation', () => {
    const grid = matrix();
    grid.toggleRow(1, false);
    expect(grid.getValidMovement(0, 0, 'ArrowDown')).toEqual({ row: 0, col: 0 });
    expect(grid.getValidMovement(0, 0, 'ArrowDown', true)).toEqual({ row: 0, col: 0 });
  });
  it('handles empty matrices without dereferencing the first row', () => {
    const grid = matrix([]);
    expect(grid.getFirstNavigableCell()).toBeNull();
    expect(() => grid.toggleColumn(0, false)).not.toThrow();
    expect(grid.getColumnAccessor(0)).toBeNull();
  });
  it('restores single and bulk update commands', () => {
    let value = 'old';
    const command = new DataGridUpdateCommand({
      prev: 'old',
      next: 'new',
      setter: (next) => {
        value = next;
      },
    });
    command.execute();
    expect(value).toBe('new');
    command.undo();
    expect(value).toBe('old');
    command.redo();
    expect(value).toBe('new');
    const values: unknown[][] = [];
    const bulk = new DataGridBulkUpdateCommand({ fields: ['a'], prev: [1], next: [2], setter: (_fields, next) => values.push(next) });
    bulk.execute();
    bulk.undo();
    expect(values).toEqual([[2], [1]]);
  });
  it('finds fields containing selector syntax safely', () => {
    const root = document.createElement('div');
    const input = document.createElement('input');
    input.dataset.field = 'rows.0.key["quoted"]';
    input.dataset.cellId = '0:1';
    root.append(input);
    const tool = new DataGridQueryTool(root);
    expect(tool.getInputByField(input.dataset.field)).toBe(input);
    expect(tool.getCoordinatesByField(input.dataset.field)).toEqual({ row: 0, col: 1 });
  });
  it('round-trips a nested tree without losing arbitrary values', () => {
    const date = new Date('2026-10-15');
    const tree = [{ id: 'root', date, children: [{ id: 0, children: [] }] }];
    const flat = flattenTree(tree, 'children');
    const restored = buildTree(flat, 1, 'children');
    expect(restored.items[0]?.date).toBe(date);
    expect(restored.update).toEqual({ id: 0, parentId: 'root', index: 0 });
  });
  it('retains stable, disambiguated layout entry ids and ignores stale section overrides', () => {
    const raw = buildCoreEntries({
      main: [
        <LayoutEntry id="a" key="a">
          A
        </LayoutEntry>,
        <LayoutEntry id="a" key="b">
          B
        </LayoutEntry>,
      ],
    });
    expect(raw.map((entry) => entry.widgetId)).toEqual(['core:a', 'core:a#2']);
    const display = buildDisplayEntries(raw, { widgets: { 'core:a': { section: 'missing', hidden: true, order: 2 } } }, new Set(['main']));
    expect(display.main?.[1]?.widgetId).toBe('core:a');
    expect(display.main?.[1]?.hidden).toBe(true);
  });
  it('falls back for unknown currencies and statuses', () => {
    expect(getCurrencyInfo('custom').decimal_digits).toBe(2);
    expect(getOrderPaymentStatus(createDashboardTranslator(), 'custom_status')).toEqual({ label: 'custom status', color: 'grey' });
  });
});
