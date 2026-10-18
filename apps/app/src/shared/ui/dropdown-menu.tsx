import { DropdownMenu as CmsMenu, clx } from '@cms/ui';
import { type ComponentProps, forwardRef } from 'react';
export const DropdownMenu = CmsMenu;
export const DropdownMenuTrigger = CmsMenu.Trigger;
export const DropdownMenuContent = CmsMenu.Content;
export const DropdownMenuLabel = CmsMenu.Label;
export const DropdownMenuSeparator = CmsMenu.Separator;
export const DropdownMenuItem = forwardRef<HTMLDivElement, ComponentProps<typeof CmsMenu.Item> & { variant?: 'default' | 'destructive' }>(
  function DropdownMenuItem({ variant, className, ...props }, ref) {
    return <CmsMenu.Item {...props} ref={ref} className={clx(variant === 'destructive' && 'text-ui-fg-error [&_svg]:text-ui-fg-error', className)} />;
  },
);
