import clsx from 'clsx';
import type React from 'react';

export type LabelProps = {
  className?: string;
} & React.HTMLAttributes<HTMLSpanElement>;

export const Label = ({ children, className }: LabelProps) => (
  <span className={clsx('text-cms-fg-base text-compact-medium-plus', className)}>{children}</span>
);
