'use client';

import { AlertDialog as BaseAlertDialog } from '@base-ui/react/alert-dialog';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import * as React from 'react';
import { autoFocus, type PartProps, part, type SurfaceEvents, surfaceChange } from './parts';

export interface RootProps extends Omit<BaseDialog.Root.Props, 'children'> {
  children?: React.ReactNode;
}
const ModalContext = React.createContext(true);
const SurfaceContext = React.createContext<React.RefObject<SurfaceEvents> | null>(null);
function Root({ onOpenChange, children, ...props }: RootProps) {
  const events = React.useRef<SurfaceEvents>({});
  return (
    <ModalContext.Provider value={props.modal !== false}>
      <SurfaceContext.Provider value={events}>
        <BaseDialog.Root
          {...props}
          onOpenChange={(open, details) => {
            surfaceChange(open, details, events.current);
            if (!details.isCanceled) onOpenChange?.(open, details);
          }}
        >
          {children}
        </BaseDialog.Root>
      </SurfaceContext.Provider>
    </ModalContext.Provider>
  );
}
function AlertRoot({ onOpenChange, children, ...props }: BaseAlertDialog.Root.Props) {
  const events = React.useRef<SurfaceEvents>({});
  return (
    <ModalContext.Provider value>
      <SurfaceContext.Provider value={events}>
        <BaseAlertDialog.Root
          {...props}
          onOpenChange={(open, details) => {
            surfaceChange(open, details, events.current);
            if (!details.isCanceled) onOpenChange?.(open, details);
          }}
        >
          {children}
        </BaseAlertDialog.Root>
      </SurfaceContext.Provider>
    </ModalContext.Provider>
  );
}
export interface PortalProps extends PartProps<typeof BaseDialog.Portal> {
  forceMount?: boolean;
}
function Portal({ forceMount, keepMounted, ...props }: PortalProps) {
  return <BaseDialog.Portal {...props} keepMounted={keepMounted ?? forceMount} />;
}
const Popup = part(BaseDialog.Popup, 'div');
export interface ContentProps extends PartProps<typeof BaseDialog.Popup>, SurfaceEvents {
  forceMount?: boolean;
}
const Content = React.forwardRef<HTMLDivElement, ContentProps>(function Content(
  {
    onEscapeKeyDown,
    onPointerDownOutside,
    onInteractOutside,
    onFocusOutside,
    onOpenAutoFocus,
    onCloseAutoFocus,
    forceMount: _,
    initialFocus,
    finalFocus,
    ...props
  },
  ref,
) {
  const events = React.useContext(SurfaceContext);
  if (events) events.current = { onEscapeKeyDown, onPointerDownOutside, onInteractOutside, onFocusOutside };
  return (
    <Popup
      {...props}
      ref={ref}
      initialFocus={initialFocus ?? (onOpenAutoFocus ? autoFocus(onOpenAutoFocus) : undefined)}
      finalFocus={finalFocus ?? (onCloseAutoFocus ? autoFocus(onCloseAutoFocus) : undefined)}
    />
  );
});
const Trigger = part(BaseDialog.Trigger, 'button');
const Close = part(BaseDialog.Close, 'button');
const NativeOverlay = part(BaseDialog.Backdrop, 'div');
// CMS assigns each nested modal its own paired backdrop, not just the root modal.
const Overlay = React.forwardRef<HTMLDivElement, PartProps<typeof BaseDialog.Backdrop>>(function Overlay(props, ref) {
  const modal = React.useContext(ModalContext);
  return modal ? <NativeOverlay forceRender {...props} ref={ref} /> : null;
});
const Title = part(BaseDialog.Title, 'h2');
const Description = part(BaseDialog.Description, 'p');
export const Dialog = { Root, Trigger, Close, Portal, DialogPortal: Portal, Content, Overlay, Title, Description };
export namespace Dialog {
  export type DialogPortalProps = PortalProps;
}
export const AlertDialog = {
  Root: AlertRoot,
  Trigger: part(BaseAlertDialog.Trigger, 'button'),
  Portal,
  AlertDialogPortal: Portal,
  Content,
  Overlay,
  Title,
  Description,
  Cancel: Close,
  Action: Close,
};
export namespace AlertDialog {
  export type AlertDialogPortalProps = PortalProps;
}
