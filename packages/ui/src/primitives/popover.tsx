'use client';

import { Popover as BasePopover } from '@base-ui/react/popover';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';
import { autoFocus, type PartProps, part, type SurfaceEvents, surfaceChange } from './parts';

export interface FloatingOptions {
  side?: BasePopover.Positioner.Props['side'];
  align?: BasePopover.Positioner.Props['align'];
  sideOffset?: number;
  alignOffset?: number;
  collisionPadding?: BasePopover.Positioner.Props['collisionPadding'];
  collisionBoundary?: BasePopover.Positioner.Props['collisionBoundary'];
  avoidCollisions?: boolean;
  sticky?: 'partial' | 'always';
  hideWhenDetached?: boolean;
  arrowPadding?: number;
  onPlaced?: () => void;
}
export function positionProps({
  side,
  align,
  sideOffset,
  alignOffset,
  collisionPadding,
  collisionBoundary,
  avoidCollisions,
  sticky,
  arrowPadding,
}: FloatingOptions): Pick<
  BasePopover.Positioner.Props,
  | 'side'
  | 'align'
  | 'sideOffset'
  | 'alignOffset'
  | 'collisionPadding'
  | 'collisionBoundary'
  | 'arrowPadding'
  | 'positionMethod'
  | 'sticky'
  | 'collisionAvoidance'
> {
  return {
    side,
    align,
    sideOffset,
    alignOffset,
    collisionPadding,
    collisionBoundary,
    arrowPadding,
    positionMethod: 'fixed' as const,
    sticky: sticky === 'always',
    ...(avoidCollisions === false ? { collisionAvoidance: { side: 'none' as const, align: 'none' as const } } : {}),
  };
}
export interface RootProps extends Omit<BasePopover.Root.Props, 'children'> {
  children?: React.ReactNode;
}
const Context = React.createContext<{
  events: React.RefObject<SurfaceEvents>;
  anchor: React.RefObject<HTMLElement | null>;
  hasAnchor: boolean;
  setHasAnchor: (value: boolean) => void;
} | null>(null);
function Root({ children, onOpenChange, ...props }: RootProps) {
  const events = React.useRef<SurfaceEvents>({});
  const anchor = React.useRef<HTMLElement | null>(null);
  const [hasAnchor, setHasAnchor] = React.useState(false);
  return (
    <Context.Provider value={{ events, anchor, hasAnchor, setHasAnchor }}>
      <BasePopover.Root
        {...props}
        onOpenChange={(open, details) => {
          surfaceChange(open, details, events.current);
          if (!details.isCanceled) onOpenChange?.(open, details);
        }}
      >
        {children}
      </BasePopover.Root>
    </Context.Provider>
  );
}
const Anchor = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean; render?: React.ReactElement }>(
  function Anchor({ asChild, render, children, ...props }, ref) {
    const context = React.useContext(Context);
    const anchorRef = React.useCallback(
      (node: HTMLElement | null) => {
        if (context) {
          context.anchor.current = node;
          context.setHasAnchor(!!node);
        }
      },
      [context?.anchor, context?.setHasAnchor],
    );
    return useRender({
      defaultTagName: 'div',
      render: asChild ? (React.Children.only(children) as React.ReactElement) : render,
      ref: [ref, anchorRef],
      props: { ...props, ...(!asChild ? { children } : {}) },
    });
  },
);
const Popup = part(BasePopover.Popup, 'div');
export interface ContentProps extends PartProps<typeof BasePopover.Popup>, FloatingOptions, SurfaceEvents {
  forceMount?: boolean;
}
const Content = React.forwardRef<HTMLDivElement, ContentProps>(function Content(
  {
    side,
    align,
    sideOffset,
    alignOffset,
    collisionPadding,
    collisionBoundary,
    avoidCollisions,
    sticky,
    hideWhenDetached: _,
    arrowPadding,
    onPlaced,
    onEscapeKeyDown,
    onPointerDownOutside,
    onFocusOutside,
    onInteractOutside,
    onOpenAutoFocus,
    onCloseAutoFocus,
    forceMount: _force,
    initialFocus,
    finalFocus,
    ...props
  },
  ref,
) {
  const context = React.useContext(Context);
  if (context) context.events.current = { onEscapeKeyDown, onPointerDownOutside, onFocusOutside, onInteractOutside };
  React.useEffect(() => {
    onPlaced?.();
  }, [onPlaced]);
  return (
    <BasePopover.Positioner
      {...positionProps({ side, align, sideOffset, alignOffset, collisionPadding, collisionBoundary, avoidCollisions, sticky, arrowPadding })}
      anchor={context?.hasAnchor ? context.anchor : undefined}
      style={{ zIndex: props.style?.zIndex }}
    >
      <Popup
        {...props}
        ref={ref}
        initialFocus={initialFocus ?? (onOpenAutoFocus ? autoFocus(onOpenAutoFocus) : undefined)}
        finalFocus={finalFocus ?? (onCloseAutoFocus ? autoFocus(onCloseAutoFocus) : undefined)}
      />
    </BasePopover.Positioner>
  );
});
export interface PortalProps extends PartProps<typeof BasePopover.Portal> {
  forceMount?: boolean;
}
function Portal({ forceMount, keepMounted, ...props }: PortalProps) {
  return <BasePopover.Portal {...props} keepMounted={keepMounted ?? forceMount} />;
}
// Keep generic native Trigger inference behind a named public type. Otherwise
// declaration emit expands its intersection into private vendor type paths.
export interface TriggerProps extends PartProps<typeof BasePopover.Trigger> {}
const Trigger: React.ForwardRefExoticComponent<TriggerProps & React.RefAttributes<HTMLElement>> = part(BasePopover.Trigger, 'button');
export const Popover = { Root, Trigger, Close: part(BasePopover.Close, 'button'), Anchor, Content, Portal };
