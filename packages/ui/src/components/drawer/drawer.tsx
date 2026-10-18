'use client';

import { XMark } from '@cms/icons';
import * as React from 'react';
import { IconButton } from '@/components/icon-button';
import { Kbd } from '@/components/kbd';
import { Text } from '@/components/text';
import { Dialog as DialogPrimitive } from '@/primitives/dialog';
import { clx } from '@/utils/clx';
import { UiLayer, uiLayerBackdrop } from '@/utils/layers';

interface DrawerRootProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root> {}

/**
 * This component is based on the [Base UI Dialog](https://base-ui.com/react/components/dialog) primitives.
 */
const DrawerRoot = (props: DrawerRootProps) => <DialogPrimitive.Root {...props} />;
DrawerRoot.displayName = 'Drawer';

interface DrawerTriggerProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger> {}

/**
 * This component is used to create the trigger button that opens the drawer.
 * It accepts props from the [Base UI Dialog Trigger](https://base-ui.com/react/components/dialog#trigger) component.
 */
const DrawerTrigger = React.forwardRef<React.ComponentRef<typeof DialogPrimitive.Trigger>, DrawerTriggerProps>(
  ({ className, ...props }: DrawerTriggerProps, ref) => <DialogPrimitive.Trigger ref={ref} className={clx(className)} {...props} />,
);
DrawerTrigger.displayName = 'Drawer.Trigger';

interface DrawerCloseProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close> {}

/**
 * This component is used to create the close button for the drawer.
 * It accepts props from the [Base UI Dialog Close](https://base-ui.com/react/components/dialog#close) component.
 */
const DrawerClose = React.forwardRef<React.ComponentRef<typeof DialogPrimitive.Close>, DrawerCloseProps>(
  ({ className, ...props }: DrawerCloseProps, ref) => <DialogPrimitive.Close ref={ref} className={clx(className)} {...props} />,
);
DrawerClose.displayName = 'Drawer.Close';

interface DrawerPortalProps extends DialogPrimitive.DialogPortalProps {}

/**
 * The `Drawer.Content` component uses this component to wrap the drawer content.
 * It accepts props from the [Base UI Dialog Portal](https://base-ui.com/react/components/dialog#portal) component.
 */
const DrawerPortal = (props: DrawerPortalProps) => <DialogPrimitive.DialogPortal {...props} />;
DrawerPortal.displayName = 'Drawer.Portal';

interface DrawerOverlayProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> {}

/**
 * This component is used to create the overlay for the drawer.
 * It accepts props from the [Base UI Dialog Overlay](https://base-ui.com/react/components/dialog#overlay) component.
 */
const DrawerOverlay = React.forwardRef<React.ComponentRef<typeof DialogPrimitive.Overlay>, DrawerOverlayProps>(
  ({ className, ...props }: DrawerOverlayProps, ref) => (
    <DialogPrimitive.Overlay
      ref={ref}
      className={clx(
        'bg-ui-bg-overlay fixed inset-0 z-ui-modal-backdrop',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className,
      )}
      {...props}
    />
  ),
);
DrawerOverlay.displayName = 'Drawer.Overlay';

interface DrawerContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /**
   * Props for the overlay component.
   * It accepts props from the [Base UI Dialog Overlay](https://base-ui.com/react/components/dialog#overlay) component.
   */
  overlayProps?: React.ComponentPropsWithoutRef<typeof DrawerOverlay>;
  /**
   * Props for the portal component that wraps the drawer content.
   * It accepts props from the [Base UI Dialog Portal](https://base-ui.com/react/components/dialog#portal) component.
   */
  portalProps?: React.ComponentPropsWithoutRef<typeof DrawerPortal>;
}

/**
 * This component wraps the content of the drawer.
 * It accepts props from the [Base UI Dialog Content](https://base-ui.com/react/components/dialog#content) component.
 */
const DrawerContent = React.forwardRef<React.ComponentRef<typeof DialogPrimitive.Content>, DrawerContentProps>(
  ({ className, overlayProps, portalProps, ...props }: DrawerContentProps, ref) => (
    <UiLayer kind="modal" zIndex={props.style?.zIndex}>
      {(layer) => (
        <DrawerPortal {...portalProps}>
          <DrawerOverlay
            {...overlayProps}
            style={{ ...overlayProps?.style, zIndex: overlayProps?.style?.zIndex ?? uiLayerBackdrop(layer) }}
            data-ui-layer="modal-backdrop"
          />
          <DialogPrimitive.Content
            ref={ref}
            className={clx(
              'bg-ui-bg-base shadow-elevation-modal border-ui-border-base fixed inset-y-2 flex w-full flex-1 flex-col rounded-lg border outline-none max-sm:inset-x-2 max-sm:w-[calc(100%-16px)] sm:right-2 sm:max-w-[560px]',
              'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-right-1/2 data-[state=open]:slide-in-from-right-1/2 duration-200',
              className,
            )}
            {...props}
            style={{ ...props.style, zIndex: layer }}
            data-ui-layer="modal"
          />
        </DrawerPortal>
      )}
    </UiLayer>
  ),
);
DrawerContent.displayName = 'Drawer.Content';

interface DrawerHeaderProps extends React.ComponentPropsWithoutRef<'div'> {}

/**
 * This component is used to wrap the header content of the drawer.
 * This component is based on the `div` element and supports all of its props.
 */
const DrawerHeader = React.forwardRef<HTMLDivElement, DrawerHeaderProps>(({ children, className, ...props }: DrawerHeaderProps, ref) => (
  <div ref={ref} className="border-ui-border-base flex items-start justify-between gap-x-4 border-b px-6 py-4" {...props}>
    <div className={clx('flex flex-col gap-y-1', className)}>{children}</div>
    <div className="flex items-center gap-x-2">
      <Kbd>esc</Kbd>
      <DialogPrimitive.Close asChild>
        <IconButton size="small" type="button" variant="transparent" aria-label="Close">
          <XMark />
        </IconButton>
      </DialogPrimitive.Close>
    </div>
  </div>
));
DrawerHeader.displayName = 'Drawer.Header';

interface DrawerBodyProps extends React.ComponentPropsWithoutRef<'div'> {}

/**
 * This component is used to wrap the body content of the drawer.
 * This component is based on the `div` element and supports all of its props
 */
const DrawerBody = React.forwardRef<HTMLDivElement, DrawerBodyProps>(({ className, ...props }: DrawerBodyProps, ref) => (
  <div ref={ref} className={clx('flex-1 px-6 py-4', className)} {...props} />
));
DrawerBody.displayName = 'Drawer.Body';

interface DrawerFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * This component is used to wrap the footer content of the drawer.
 * This component is based on the `div` element and supports all of its props.
 */
const DrawerFooter = ({ className, ...props }: DrawerFooterProps) => (
  <div className={clx('border-ui-border-base flex items-center justify-end space-x-2 overflow-y-auto border-t px-6 py-4', className)} {...props} />
);
DrawerFooter.displayName = 'Drawer.Footer';

/**
 * This component adds an accessible title to the drawer.
 * It accepts props from the [Base UI Dialog Title](https://base-ui.com/react/components/dialog#title) component.
 */
const DrawerTitle = DialogPrimitive.Title;
DrawerTitle.displayName = 'Drawer.Title';

interface DrawerDescriptionProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> {}

/**
 * This component adds accessible description to the drawer.
 * It accepts props from the [Base UI Dialog Description](https://base-ui.com/react/components/dialog#description) component.
 */
const DrawerDescription = React.forwardRef<React.ComponentRef<typeof DialogPrimitive.Description>, DrawerDescriptionProps>(
  ({ className, children, ...props }: DrawerDescriptionProps, ref) => (
    <DialogPrimitive.Description ref={ref} className={clx(className)} asChild {...props}>
      <Text>{children}</Text>
    </DialogPrimitive.Description>
  ),
);
DrawerDescription.displayName = 'Drawer.Description';

const Drawer = Object.assign(DrawerRoot, {
  Body: DrawerBody,
  Close: DrawerClose,
  Content: DrawerContent,
  Description: DrawerDescription,
  Footer: DrawerFooter,
  Header: DrawerHeader,
  Title: DrawerTitle,
  Trigger: DrawerTrigger,
});

export { Drawer };
