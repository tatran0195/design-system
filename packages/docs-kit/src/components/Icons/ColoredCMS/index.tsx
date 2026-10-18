import { CMS } from '@cms/icons';
import clsx from 'clsx';
import type React from 'react';

type CMSIconProps = React.ComponentProps<typeof CMS> & {
  variant?: 'base' | 'subtle' | 'muted';
};

export const ColoredCMSIcon = ({ className, variant = 'base', ...props }: CMSIconProps) => (
  <CMS
    {...props}
    className={clsx(
      className,
      variant === 'base' && '[&_path]:fill-cms-fg-base',
      variant === 'subtle' && '[&_path]:fill-cms-fg-subtle',
      variant === 'muted' && '[&_path]:fill-cms-fg-muted',
    )}
  />
);
