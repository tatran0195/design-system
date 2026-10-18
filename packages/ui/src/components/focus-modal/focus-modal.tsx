'use client';

import { XMark } from '@cms/icons';
import * as React from 'react';
import { IconButton } from '@/components/icon-button';
import { Kbd } from '@/components/kbd';
import { Dialog as DialogPrimitive } from '@/primitives/dialog';
import { clx } from '@/utils/clx';
import { UiLayer, uiLayerBackdrop } from '@/utils/layers';

/**
 * @prop defaultOpen - Whether the modal is opened by default.
 * @prop open - Whether the modal is opened.
 * @prop onOpenChange - A function to handle when the modal is opened or closed.
 */
interface FocusModalRootProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root> {}

/**
 * This component is based on the [Base UI Dialog](https://base-ui.com/react/components/dialog) primitives.
 */
const FocusModalRoot = (props: FocusModalRootProps) => <DialogPrimitive.Root {...props} />;
FocusModalRoot.displayName = 'FocusModal';

interface FocusModalTriggerProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger> {}

/**
 * This component is used to create the trigger button that opens the modal.
 * It accepts props from the [Base UI Dialog Trigger](https://base-ui.com/react/components/dialog#trigger) component.
 */
const FocusModalTrigger = React.forwardRef<React.ComponentRef<typeof DialogPrimitive.Trigger>, FocusModalTriggerProps>(
  (props: FocusModalTriggerProps, ref) => <DialogPrimitive.Trigger ref={ref} {...props} />,
);
FocusModalTrigger.displayName = 'FocusModal.Trigger';

/**
 * This component is used to create the close button for the modal.
 * It accepts props from the [Base UI Dialog Close](https://base-ui.com/react/components/dialog#close) component.
 */
const FocusModalClose = DialogPrimitive.Close;
FocusModalClose.displayName = 'FocusModal.Close';

interface FocusModalPortalProps extends DialogPrimitive.DialogPortalProps {}

/**
 * The `FocusModal.Content` component uses this component to wrap the modal content.
 * It accepts props from the [Base UI Dialog Portal](https://base-ui.com/react/components/dialog#portal) component.
 */
const FocusModalPortal = (props: FocusModalPortalProps) => <DialogPrimitive.DialogPortal {...props} />;
FocusModalPortal.displayName = 'FocusModal.Portal';

/**
 * This component is used to create the overlay for the modal.
 * It accepts props from the [Base UI Dialog Overlay](https://base-ui.com/react/components/dialog#overlay) component.
 */
const FocusModalOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={clx(
      'bg-ui-bg-overlay fixed inset-0 z-ui-modal-backdrop',
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
));
FocusModalOverlay.displayName = 'FocusModal.Overlay';

/**
 * This component wraps the content of the modal.
 * It accepts props from the [Base UI Dialog Content](https://base-ui.com/react/components/dialog#content) component.
 */
const FocusModalContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    overlayProps?: React.ComponentPropsWithoutRef<typeof FocusModalOverlay>;
    portalProps?: React.ComponentPropsWithoutRef<typeof FocusModalPortal>;
  }
>(({ className, overlayProps, portalProps, ...props }, ref) => (
  <UiLayer kind="modal" zIndex={props.style?.zIndex}>
    {(layer) => (
      <FocusModalPortal {...portalProps}>
        <FocusModalOverlay
          {...overlayProps}
          style={{ ...overlayProps?.style, zIndex: overlayProps?.style?.zIndex ?? uiLayerBackdrop(layer) }}
          data-ui-layer="modal-backdrop"
        />
        <DialogPrimitive.Content
          ref={ref}
          className={clx(
            'bg-ui-bg-base shadow-elevation-modal fixed inset-2 flex flex-col overflow-hidden rounded-lg border outline-none',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-0 data-[state=closed]:slide-in-from-bottom-2  duration-200',
            className,
          )}
          {...props}
          style={{ ...props.style, zIndex: layer }}
          data-ui-layer="modal"
        />
      </FocusModalPortal>
    )}
  </UiLayer>
));
FocusModalContent.displayName = 'FocusModal.Content';

/**
 * This component is used to wrap the header content of the modal.
 * This component is based on the `div` element and supports all of its props
 */
const FocusModalHeader = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(({ children, className, ...props }, ref) => (
  <div ref={ref} className={clx('border-ui-border-base flex items-center justify-between gap-x-4 border-b px-4 py-2', className)} {...props}>
    <div className="flex items-center gap-x-2">
      <DialogPrimitive.Close asChild>
        <IconButton size="small" type="button" variant="transparent" aria-label="Close">
          <XMark />
        </IconButton>
      </DialogPrimitive.Close>
      <Kbd>esc</Kbd>
    </div>
    {children}
  </div>
));
FocusModalHeader.displayName = 'FocusModal.Header';

/**
 * This component is used to wrap the footer content of the modal.
 * This component is based on the `div` element and supports all of its props
 */
const FocusModalFooter = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(({ children, className, ...props }, ref) => (
  <div ref={ref} className={clx('border-ui-border-base flex items-center justify-end gap-x-2 border-t p-4', className)} {...props}>
    {children}
  </div>
));
FocusModalFooter.displayName = 'FocusModal.Footer';

interface FocusModalTitleProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> {}

/**
 * This component adds an accessible title to the modal.
 * It accepts props from the [Base UI Dialog Title](https://base-ui.com/react/components/dialog#title) component.
 */
const FocusModalTitle = React.forwardRef<HTMLHeadingElement, FocusModalTitleProps>(({ className, ...props }: FocusModalTitleProps, ref) => (
  <DialogPrimitive.Title ref={ref} className={className} {...props} />
));
FocusModalTitle.displayName = 'FocusModal.Title';

/**
 * This component adds accessible description to the modal.
 * It accepts props from the [Base UI Dialog Description](https://base-ui.com/react/components/dialog#description) component.
 */
const FocusModalDescription = DialogPrimitive.Description;
FocusModalDescription.displayName = 'FocusModal.Description';

/**
 * This component is used to wrap the body content of the modal.
 * This component is based on the `div` element and supports all of its props
 */
const FocusModalBody = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(({ className, ...props }, ref) => (
  <div ref={ref} className={clx('flex-1', className)} {...props} />
));
FocusModalBody.displayName = 'FocusModal.Body';

const FocusModal = Object.assign(FocusModalRoot, {
  Trigger: FocusModalTrigger,
  Title: FocusModalTitle,
  Description: FocusModalDescription,
  Content: FocusModalContent,
  Header: FocusModalHeader,
  Body: FocusModalBody,
  Close: FocusModalClose,
  Footer: FocusModalFooter,
});

export { FocusModal };
