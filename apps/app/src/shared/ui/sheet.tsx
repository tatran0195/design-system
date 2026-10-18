import { clx, Drawer } from '@cms/ui';
import { type ComponentProps, forwardRef } from 'react';
export const Sheet = Drawer;
export const SheetTrigger = Drawer.Trigger;
export const SheetHeader = Drawer.Header;
export const SheetTitle = Drawer.Title;
export const SheetContent = forwardRef<HTMLDivElement, ComponentProps<typeof Drawer.Content> & { side?: 'left' | 'right' | 'top' | 'bottom' }>(
  function SheetContent({ side = 'right', className, ...props }, ref) {
    return (
      <Drawer.Content
        {...props}
        ref={ref}
        className={clx(side === 'left' && 'start-2 end-auto', side === 'right' && 'end-2 start-auto', className)}
      />
    );
  },
);
