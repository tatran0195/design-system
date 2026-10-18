import { Alert as CmsAlert, clx } from '@cms/ui';
import type { ComponentProps } from 'react';
export function Alert({
  variant = 'default',
  children,
  ...props
}: Omit<ComponentProps<typeof CmsAlert>, 'variant'> & { variant?: 'default' | 'destructive' | 'info' | 'warning' | 'success' }) {
  return (
    <CmsAlert {...props} variant={variant === 'destructive' ? 'error' : variant === 'default' ? 'info' : variant}>
      <div>{children}</div>
    </CmsAlert>
  );
}
export function AlertTitle({ className, ...props }: ComponentProps<'h5'>) {
  return <h5 {...props} className={clx('mb-1 font-medium text-ui-fg-base', className)} />;
}
export function AlertDescription({ className, ...props }: ComponentProps<'div'>) {
  return <div {...props} className={clx('text-sm text-ui-fg-subtle', className)} />;
}
