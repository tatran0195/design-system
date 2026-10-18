import { clx } from '@cms/ui';
import type { ComponentPropsWithoutRef } from 'react';
import { Link } from '../../../routing';

interface LinkButtonProps extends ComponentPropsWithoutRef<typeof Link> {
  variant?: 'primary' | 'interactive';
}

export const LinkButton = ({ className, variant = 'interactive', ...props }: LinkButtonProps) => (
  <Link
    className={clx(
      'transition-fg txt-compact-small-plus rounded-[4px] outline-none',
      'focus-visible:shadow-borders-focus',
      {
        'text-ui-fg-interactive hover:text-ui-fg-interactive-hover': variant === 'interactive',
        'text-ui-fg-base hover:text-ui-fg-subtle': variant === 'primary',
      },
      className,
    )}
    {...props}
  />
);
