'use client';

import { Dialog as SheetPrimitive } from '@base-ui/react/dialog';
import { XMark } from '@cms/icons';
import type * as React from 'react';
import { IconButton } from '@/components/icon-button';
import { surfaceChange } from '@/primitives/parts';
import { clx } from '@/utils/clx';
import { UiLayer, uiLayerBackdrop, uiLayerStyle } from '@/utils/layers';

/**
 * Internal side-sheet used by `Sidebar` in mobile mode. Migrated from the
 * nibleaf design system (`@base-ui/react/dialog`), restyled with cms `ui-*`
 * tokens. Not part of the public `@cms/ui` API — the primary modal surfaces
 * are `Drawer` / `FocusModal` / `Prompt`.
 */

function Sheet({ onOpenChange, ...props }: SheetPrimitive.Root.Props) {
  return (
    <SheetPrimitive.Root
      data-slot="sheet"
      {...props}
      onOpenChange={(open, details) => {
        surfaceChange(open, details, {});
        if (!details.isCanceled) onOpenChange?.(open, details);
      }}
    />
  );
}

function SheetTrigger({ ...props }: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={clx(
        'bg-ui-bg-overlay fixed inset-0 z-ui-navigation-backdrop transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs',
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = 'right',
  showCloseButton = true,
  ...props
}: SheetPrimitive.Popup.Props & {
  side?: 'top' | 'right' | 'bottom' | 'left';
  showCloseButton?: boolean;
}) {
  return (
    <UiLayer kind="navigation">
      {(layer) => (
        <SheetPortal>
          <SheetOverlay style={{ zIndex: uiLayerBackdrop(layer) }} data-ui-layer="navigation-backdrop" />
          <SheetPrimitive.Popup
            data-slot="sheet-content"
            data-side={side}
            className={clx(
              'txt-compact-small shadow-elevation-modal fixed z-ui-navigation flex flex-col gap-4 bg-ui-bg-component bg-clip-padding text-ui-fg-base transition duration-200 ease-in-out motion-reduce:transition-none data-ending-style:opacity-0 data-starting-style:opacity-0 data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=bottom]:border-ui-border-base data-[side=bottom]:data-ending-style:translate-y-[2.5rem] data-[side=bottom]:data-starting-style:translate-y-[2.5rem] data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-e data-[side=left]:border-ui-border-base data-[side=left]:data-ending-style:translate-x-[-2.5rem] data-[side=left]:data-starting-style:translate-x-[-2.5rem] rtl:data-[side=left]:data-ending-style:-translate-x-[-2.5rem] rtl:data-[side=left]:data-starting-style:-translate-x-[-2.5rem] data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-s data-[side=right]:border-ui-border-base data-[side=right]:data-ending-style:translate-x-[2.5rem] data-[side=right]:data-starting-style:translate-x-[2.5rem] rtl:data-[side=right]:data-ending-style:-translate-x-[2.5rem] rtl:data-[side=right]:data-starting-style:-translate-x-[2.5rem] data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=top]:border-ui-border-base data-[side=top]:data-ending-style:translate-y-[-2.5rem] data-[side=top]:data-starting-style:translate-y-[-2.5rem] data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm',
              className,
            )}
            {...props}
            style={uiLayerStyle(layer, props.style)}
            data-ui-layer="navigation"
          >
            {children}
            {showCloseButton && (
              <SheetPrimitive.Close
                data-slot="sheet-close"
                render={<IconButton variant="transparent" size="small" className="absolute end-4 top-4" />}
              >
                <XMark />
                <span className="sr-only">Close</span>
              </SheetPrimitive.Close>
            )}
          </SheetPrimitive.Popup>
        </SheetPortal>
      )}
    </UiLayer>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="sheet-header" className={clx('flex flex-col gap-1.5 p-4', className)} {...props} />;
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="sheet-footer" className={clx('mt-auto flex flex-col gap-2 p-4', className)} {...props} />;
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return <SheetPrimitive.Title data-slot="sheet-title" className={clx('font-medium text-ui-fg-base', className)} {...props} />;
}

function SheetDescription({ className, ...props }: SheetPrimitive.Description.Props) {
  return <SheetPrimitive.Description data-slot="sheet-description" className={clx('txt-compact-small text-ui-fg-muted', className)} {...props} />;
}

export { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger };
