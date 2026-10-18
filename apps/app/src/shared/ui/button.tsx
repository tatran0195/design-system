import { Button as CmsButton, clx } from '@cms/ui';
import { type ComponentProps, cloneElement, forwardRef, type ReactElement } from 'react';

type Props = Omit<ComponentProps<typeof CmsButton>, 'variant' | 'size'> & {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'xs' | 'lg' | 'icon' | 'icon-sm' | 'icon-xs' | 'icon-lg';
  render?: ReactElement;
  nativeButton?: boolean;
};
export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'default', size = 'default', render, children, className, nativeButton: _nativeButton, ...props },
  ref,
) {
  const cmsVariant = variant === 'default' ? 'primary' : variant === 'destructive' ? 'danger' : variant;
  const cmsSize =
    size === 'lg' || size === 'icon-lg' ? 'large' : size === 'sm' || size === 'xs' || size === 'icon-xs' || size === 'icon-sm' ? 'small' : 'base';
  return (
    <CmsButton
      {...props}
      data-slot="button"
      ref={ref}
      variant={cmsVariant}
      size={cmsSize}
      asChild={Boolean(render) || props.asChild}
      className={clx(
        size.startsWith('icon') && 'size-8 shrink-0 p-0',
        size === 'icon-xs' && 'size-6',
        size === 'icon-sm' && 'size-7',
        size === 'icon-lg' && 'size-10',
        size === 'xs' && 'h-6 px-1.5 text-xs',
        className,
      )}
    >
      {render ? (children === undefined ? render : cloneElement(render, undefined, children)) : children}
    </CmsButton>
  );
});
