import clsx from 'clsx';
import type React from 'react';
import { ShadedBlock } from '../../ShadedBlock';

export type H1Props = React.HTMLAttributes<HTMLHeadingElement> & {
  id?: string;
  variant?: 'default' | 'content';
};

export const H1 = ({ className, variant = 'default', ...props }: H1Props) => (
  <div className="flex flex-col items-start justify-between gap-docs_1 mb-docs_1 h1-wrapper">
    <h1 className={clsx('text-h1 [&>code]:!text-h1 [&>code]:!font-mono text-cms-fg-base', props.id && 'scroll-m-docs_7', className)} {...props} />
    {variant === 'content' && <ShadedBlock className="!w-full !h-docs_2" />}
  </div>
);
