import clsx from 'clsx';
import type React from 'react';

export type BorderedProps = {
  wrapperClassName?: string;
} & React.HTMLAttributes<HTMLSpanElement>;

export const Bordered = ({ wrapperClassName, children }: BorderedProps) => (
  <span
    className={clsx(
      'border-cms-border-strong bg-cms-bg-base',
      'mr-docs_1 inline-flex w-fit items-center justify-center rounded-docs_DEFAULT border border-solid p-[3px]',
      'no-zoom-img',
      wrapperClassName,
    )}
  >
    {children}
  </span>
);
