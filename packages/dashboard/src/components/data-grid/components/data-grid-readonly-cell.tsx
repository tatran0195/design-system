import { clx } from '@cms/ui';
import type { PropsWithChildren } from 'react';
import { useDataGridCellError } from '../hooks';
import type { DataGridCellProps } from '../types';
import { DataGridRowErrorIndicator } from './data-grid-row-error-indicator';

type DataGridReadonlyCellProps<TData extends object, TValue = any> = PropsWithChildren<DataGridCellProps<TData, TValue>> & {
  color?: 'muted' | 'normal';
  isMultiLine?: boolean;
};

export const DataGridReadonlyCell = <TData extends object, TValue = any>({
  context,
  color = 'muted',
  children,
  isMultiLine = false,
}: DataGridReadonlyCellProps<TData, TValue>) => {
  const { rowErrors } = useDataGridCellError({ context });

  return (
    <div
      className={clx(
        'txt-compact-small text-ui-fg-subtle flex w-full cursor-not-allowed justify-between overflow-hidden px-4 py-2.5 outline-none',
        color === 'muted' && 'bg-ui-bg-subtle',
        color === 'normal' && 'bg-ui-bg-base',
        'h-full items-center',
      )}
    >
      <div
        className={clx('flex-1', {
          truncate: !isMultiLine,
          'whitespace-pre-wrap break-words': isMultiLine,
        })}
      >
        {children}
      </div>
      <DataGridRowErrorIndicator rowErrors={rowErrors} />
    </div>
  );
};
