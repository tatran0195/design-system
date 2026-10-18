import clsx from 'clsx';
import type React from 'react';

export type KbdProps = React.ComponentProps<'kbd'> & {
  variant?: 'default' | 'small';
};

export const Kbd = ({ children, className, variant = 'default', ...props }: KbdProps) => (
  <kbd
    className={clsx(
      'rounded-docs_xs border-solid border border-cms-border-base',
      'inline-flex items-center justify-center',
      'px-docs_0.25',
      'bg-cms-bg-field',
      'text-cms-fg-base',
      'font-base shadow-none',
      variant === 'small' ? 'text-compact-x-small' : 'text-compact-x-small-plus',
      className,
    )}
    {...props}
  >
    {children}
  </kbd>
);
