import clsx from 'clsx';
import type React from 'react';

export const H4 = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h4 className={clsx('mb-docs_1 text-cms-fg-base text-h4', className)} {...props} />
);
