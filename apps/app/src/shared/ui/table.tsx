import { Table as CmsTable } from '@cms/ui';
import { type ComponentProps, forwardRef } from 'react';
/** Keep the copied table's horizontal scroll boundary around the primary CMS
 * table. Its intrinsic columns must not widen a mobile page or modal. */
export const Table = forwardRef<HTMLTableElement, ComponentProps<typeof CmsTable>>(function Table(props, ref) {
  return (
    <div data-slot="table-container" className="relative w-full max-w-full overflow-x-auto">
      <CmsTable {...props} ref={ref} />
    </div>
  );
});
export const TableBody = CmsTable.Body;
export const TableCell = CmsTable.Cell;
export const TableHeader = CmsTable.Header;
export const TableHead = CmsTable.HeaderCell;
export const TableRow = CmsTable.Row;
