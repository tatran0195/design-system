'use client';

import type { DataTableCellContext, DataTableHeaderContext, DataTableRowData } from '@/blocks/data-table/types';
import { Checkbox, type CheckboxCheckedState } from '@/components/checkbox';

interface DataTableSelectCellProps<TData extends DataTableRowData = DataTableRowData> {
  ctx: DataTableCellContext<TData, unknown>;
}

const DataTableSelectCell = <TData extends DataTableRowData = DataTableRowData>(props: DataTableSelectCellProps<TData>) => {
  const checked = props.ctx.row.getIsSelected();
  const onChange = props.ctx.row.getToggleSelectedHandler();
  const disabled = !props.ctx.row.getCanSelect();

  return <Checkbox onClick={(e) => e.stopPropagation()} checked={checked} onCheckedChange={onChange} disabled={disabled} />;
};
DataTableSelectCell.displayName = 'DataTable.SelectCell';

interface DataTableSelectHeaderProps<TData extends DataTableRowData = DataTableRowData> {
  ctx: DataTableHeaderContext<TData, unknown>;
}

const DataTableSelectHeader = <TData extends DataTableRowData = DataTableRowData>(props: DataTableSelectHeaderProps<TData>) => {
  const checked = props.ctx.table.getIsSomePageRowsSelected() ? 'indeterminate' : props.ctx.table.getIsAllPageRowsSelected();

  const onChange = (checked: CheckboxCheckedState) => {
    props.ctx.table.toggleAllPageRowsSelected(!!checked);
  };
  const disabled = !props.ctx.table.getRowModel().rows.some((row) => row.getCanSelect());

  return <Checkbox onClick={(e) => e.stopPropagation()} checked={checked} onCheckedChange={onChange} disabled={disabled} />;
};

export type { DataTableSelectCellProps, DataTableSelectHeaderProps };
export { DataTableSelectCell, DataTableSelectHeader };
