'use client';
import { clx, Drawer, FocusModal } from '@cms/ui';
import { type ReactElement, type ReactNode, useState } from 'react';
import type { To } from '../../routing';
import { RouteModalForm } from './route-modal-form';
import { useRouteModal } from './route-modal-provider';
import { RouteModalProvider } from './route-modal-provider/route-provider';
import { StackedModalProvider } from './stacked-modal-provider';
export interface RouteModalProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  onSuccess?: (path?: string) => void;
  onCloseError?: (error: unknown) => void;
  prev?: To | number;
  className?: string;
}
type ModalParts = 'Header' | 'Title' | 'Description' | 'Body' | 'Footer' | 'Close';
export type RouteDrawerComponent = ((props: RouteModalProps) => ReactElement) & Pick<typeof Drawer, ModalParts> & { Form: typeof RouteModalForm };
export type RouteFocusModalComponent = ((props: RouteModalProps) => ReactElement) &
  Pick<typeof FocusModal, ModalParts> & { Form: typeof RouteModalForm };
export function createRouteModal(kind: 'drawer'): RouteDrawerComponent;
export function createRouteModal(kind: 'focus'): RouteFocusModalComponent;
export function createRouteModal(kind: 'drawer' | 'focus'): RouteDrawerComponent | RouteFocusModalComponent {
  const Primitive = kind === 'drawer' ? Drawer : FocusModal;
  function Content({
    open,
    onOpenChange,
    children,
    className,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: ReactNode;
    className?: string;
  }) {
    const { requestClose, __internal } = useRouteModal();
    const [stacked, setStacked] = useState(false);
    return (
      <Primitive
        open={open}
        onOpenChange={(next) => {
          if (next) onOpenChange(true);
          else void requestClose();
        }}
      >
        <StackedModalProvider onOpenChange={setStacked}>
          <Primitive.Content
            className={clx(stacked && 'bg-ui-bg-disabled', className)}
            onEscapeKeyDown={(event) => {
              if (!__internal.closeOnEscape || stacked) event.preventDefault();
            }}
            aria-describedby={undefined}
          >
            {children}
          </Primitive.Content>
        </StackedModalProvider>
      </Primitive>
    );
  }
  function Root({
    children,
    open: controlled,
    defaultOpen = true,
    onOpenChange,
    onClose,
    onSuccess,
    onCloseError,
    prev,
    className,
  }: RouteModalProps) {
    const [internal, setInternal] = useState(defaultOpen);
    const open = controlled ?? internal;
    const change = (next: boolean) => {
      setInternal(next);
      onOpenChange?.(next);
    };
    return (
      <RouteModalProvider
        prev={prev}
        onSuccess={onSuccess}
        onCloseError={onCloseError}
        onClose={() => {
          change(false);
          onClose?.();
        }}
      >
        <Content open={open} onOpenChange={change} className={className}>
          {children}
        </Content>
      </RouteModalProvider>
    );
  }
  return Object.assign(Root, {
    Header: Primitive.Header,
    Title: Primitive.Title,
    Description: Primitive.Description,
    Body: Primitive.Body,
    Footer: Primitive.Footer,
    Close: Primitive.Close,
    Form: RouteModalForm,
  }) as RouteDrawerComponent | RouteFocusModalComponent;
}
