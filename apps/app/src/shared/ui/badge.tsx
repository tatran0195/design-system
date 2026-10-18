import { Badge as CmsBadge, clx } from '@cms/ui';
import type { ComponentProps } from 'react';
export function Badge({
  variant = 'default',
  className,
  ...props
}: Omit<ComponentProps<typeof CmsBadge>, 'variant'> & { variant?: 'default' | 'secondary' | 'outline' | 'destructive' }) {
  return (
    <CmsBadge
      {...props}
      size="2xsmall"
      color={variant === 'destructive' ? 'red' : 'grey'}
      className={clx(variant === 'outline' && 'bg-transparent', className)}
    />
  );
}
