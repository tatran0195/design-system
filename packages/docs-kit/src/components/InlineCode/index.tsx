'use client';

import clsx from 'clsx';
import type React from 'react';
import { CopyButton } from '@/components/CopyButton';

export type InlineCodeProps = React.ComponentProps<'code'> & {
  variant?: 'default' | 'grey-bg';
};

export const InlineCode = ({ variant = 'default', ...props }: InlineCodeProps) => (
  <CopyButton text={props.children as string} buttonClassName={clsx('bg-transparent border-0 p-0 inline text-cms-fg-subtle group', 'font-monospace')}>
    <code
      {...props}
      className={clsx(
        'text-cms-tag-neutral-text border whitespace-break-spaces',
        'font-monospace text-code-label rounded-docs_sm py-0 px-[5px]',
        variant === 'default' && [
          'bg-cms-tag-neutral-bg group-hover:bg-cms-tag-neutral-bg-hover',
          'group-active:bg-cms-bg-subtle-pressed group-focus:bg-cms-bg-subtle-pressed',
          'border-cms-tag-neutral-border',
        ],
        variant === 'grey-bg' && [
          'bg-cms-bg-switch-off group-hover:bg-cms-bg-switch-off-hover',
          'group-active:bg-cms-bg-switch-off-hover group-focus:bg-cms-switch-off-hover',
          'border-cms-border-strong',
        ],
        props.className,
      )}
    />
  </CopyButton>
);
