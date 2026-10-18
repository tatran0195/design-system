import { Table as UiTable } from '@cms/ui';
import clsx from 'clsx';
import type React from 'react';

type RootProps = React.HTMLAttributes<HTMLTableElement>;

const Root = ({ className, ...props }: RootProps) => (
  <UiTable
    className={clsx(
      className,
      'table-fixed mb-docs_1',
      '[&_pre_span]:!max-w-full [&_pre_span]:!break-words [&_pre_span]:!whitespace-break-spaces',
      '[&_pre>div]:mt-docs_1',
      'shadow-elevation-card-rest dark:shadow-elevation-card-rest-dark',
      'rounded-docs_DEFAULT',
    )}
    {...props}
  />
);

type HeaderProps = React.HTMLAttributes<HTMLTableSectionElement>;

const Header = ({ className, ...props }: HeaderProps) => (
  <UiTable.Header
    className={clsx(className, '!border-0 bg-cms-bg-component [&_tr]:!bg-cms-bg-component', 'rounded-docs_DEFAULT [&_tr]:rounded-docs_DEFAULT')}
    {...props}
  />
);

type HeaderCellProps = React.HTMLAttributes<HTMLTableCellElement>;

const HeaderCell = ({ className, ...props }: HeaderCellProps) => (
  <UiTable.HeaderCell
    className={clsx(
      className,
      'text-left !px-docs_0.75 py-docs_0.5 break-words',
      '!text-compact-small-plus text-cms-fg-subtle',
      'first:rounded-tl-docs_DEFAULT last:rounded-tr-docs_DEFAULT',
    )}
    {...props}
  />
);

type CellProps = React.HTMLAttributes<HTMLTableCellElement>;

const Cell = ({ className, ...props }: CellProps) => (
  <UiTable.Cell className={clsx(className, '!px-docs_0.75 py-docs_0.5 break-words align-top')} {...props} />
);

type BodyProps = React.HTMLAttributes<HTMLTableSectionElement>;

const Body = ({ className, ...props }: BodyProps) => (
  <UiTable.Body className={clsx(className, '[&_tr:last-child]:border-b-0 border-b-0')} {...props} />
);

const Table = Object.assign(Root, {
  Row: UiTable.Row,
  Cell,
  Header,
  HeaderCell,
  Body,
});

export { Table };
