import { Adjustments } from '@cms/icons';
import { DropdownMenu } from '@/components/dropdown-menu';
import { IconButton } from '@/components/icon-button';
import { Tooltip } from '@/components/tooltip';
import { useDataTableContext } from '../context/use-data-table-context';
import type { DataTableColumn } from '../types';

interface DataTableColumnVisibilityMenuProps {
  className?: string;
  tooltip?: string;
}

const DataTableColumnVisibilityMenu = ({ className, tooltip }: DataTableColumnVisibilityMenuProps) => {
  const { instance, enableColumnVisibility } = useDataTableContext();

  if (!enableColumnVisibility) {
    return null;
  }

  const columns = instance.getAllColumns().filter((column) => column.getCanHide());

  const handleToggleAll = (value: boolean) => {
    instance.setColumnVisibility(Object.fromEntries(columns.map((column: DataTableColumn) => [column.id, value])));
  };

  const allColumnsVisible = columns.every((column: DataTableColumn) => column.getIsVisible());
  const someColumnsVisible = columns.some((column: DataTableColumn) => column.getIsVisible());

  const trigger = (
    <DropdownMenu.Trigger asChild>
      <IconButton size="small" className={className} aria-label={tooltip || 'Columns'}>
        <Adjustments />
      </IconButton>
    </DropdownMenu.Trigger>
  );

  return (
    <DropdownMenu modal={false}>
      {tooltip ? <Tooltip content={tooltip}>{trigger}</Tooltip> : trigger}
      <DropdownMenu.Content align="end" className="min-w-[200px] max-h-[400px] overflow-hidden">
        <DropdownMenu.Label>Toggle columns</DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.CheckboxItem
          checked={allColumnsVisible ? true : someColumnsVisible ? 'indeterminate' : false}
          onSelect={(e) => e.preventDefault()}
          onCheckedChange={(value) => handleToggleAll(value === true)}
        >
          Toggle all
        </DropdownMenu.CheckboxItem>
        <DropdownMenu.Separator />
        <div className="max-h-[250px] overflow-y-auto">
          {columns.map((column: DataTableColumn) => {
            const meta = column.columnDef.meta as { name?: string } | undefined;

            return (
              <DropdownMenu.CheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onSelect={(e) => e.preventDefault()}
                onCheckedChange={(value) => column.toggleVisibility(value === true)}
              >
                <span className="truncate">{meta?.name || (typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id)}</span>
              </DropdownMenu.CheckboxItem>
            );
          })}
        </div>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

export type { DataTableColumnVisibilityMenuProps };
export { DataTableColumnVisibilityMenu };
