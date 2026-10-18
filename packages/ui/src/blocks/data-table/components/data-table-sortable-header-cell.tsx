import { DotsSix } from '@cms/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as React from 'react';
import { Table } from '@/components/table';
import { clx } from '@/utils/clx';

interface DataTableSortableHeaderCellProps extends React.HTMLAttributes<HTMLTableCellElement> {
  id: string;
  children: React.ReactNode;
  isFirstColumn?: boolean;
}

export const DataTableSortableHeaderCell = React.forwardRef<HTMLTableCellElement, DataTableSortableHeaderCellProps>(
  ({ id, children, className, style: propStyle, isFirstColumn, ...props }, ref) => {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
      id,
    });

    // Only apply horizontal transform, ignore vertical movement
    const transformStyle = transform
      ? {
          x: transform.x,
          y: 0,
          scaleX: 1,
          scaleY: 1,
        }
      : null;

    const style: React.CSSProperties = {
      ...propStyle,
      transform: transformStyle ? CSS.Transform.toString(transformStyle) : undefined,
      transition,
      opacity: isDragging ? 0.9 : 1,
      zIndex: isDragging ? 3 : isFirstColumn ? 1 : undefined,
    };

    const combineRefs = (element: HTMLTableCellElement | null) => {
      setNodeRef(element);
      if (ref) {
        if (typeof ref === 'function') {
          ref(element);
        } else {
          ref.current = element;
        }
      }
    };

    return (
      <Table.HeaderCell
        ref={combineRefs}
        style={style}
        className={clx(className, 'group/header-cell bg-ui-bg-subtle', {
          'bg-ui-bg-base border-ui-border-interactive shadow-elevation-flyout': isDragging,
        })}
        {...props}
      >
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            aria-label={`Reorder ${id} column`}
            className="text-ui-fg-muted hover:text-ui-fg-base focus-visible:shadow-borders-focus flex size-5 shrink-0 cursor-grab items-center justify-center rounded outline-none active:cursor-grabbing"
          >
            <DotsSix aria-hidden />
          </button>
          {children}
        </div>
      </Table.HeaderCell>
    );
  },
);

DataTableSortableHeaderCell.displayName = 'DataTableSortableHeaderCell';
