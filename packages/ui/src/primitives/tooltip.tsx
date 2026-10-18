'use client';

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import * as React from 'react';
import { type PartProps, part, type SurfaceEvents, surfaceChange } from './parts';
import { type FloatingOptions, positionProps } from './popover';

export interface RootProps extends Omit<BaseTooltip.Root.Props, 'children'> {
  children?: React.ReactNode;
  delayDuration?: number;
  disableHoverableContent?: boolean;
  contentId?: string;
}
const Settings = React.createContext<{
  delay?: number;
  events?: React.RefObject<SurfaceEvents>;
  triggerId?: string;
  contentId?: string;
  open?: boolean;
}>({});
const Hoverable = React.createContext(false);
function Root({ delayDuration, disableHoverableContent, contentId, children, onOpenChange, ...props }: RootProps) {
  const inherited = React.useContext(Hoverable);
  const triggerId = React.useId();
  const events = React.useRef<SurfaceEvents>({});
  const [uncontrolledOpen, setOpen] = React.useState(props.defaultOpen ?? false);
  const open = props.open ?? uncontrolledOpen;
  return (
    <Settings.Provider value={{ delay: delayDuration, events, triggerId, open, contentId: contentId ?? `${triggerId}-content` }}>
      <BaseTooltip.Root
        {...props}
        open={open}
        defaultTriggerId={props.defaultTriggerId ?? triggerId}
        disableHoverablePopup={disableHoverableContent ?? inherited}
        onOpenChange={(next, details) => {
          surfaceChange(next, details, events.current);
          if (!details.isCanceled) {
            onOpenChange?.(next, details);
            if (!details.isCanceled && props.open === undefined) setOpen(next);
          }
        }}
      >
        {children}
      </BaseTooltip.Root>
    </Settings.Provider>
  );
}
const NativeTrigger = part(BaseTooltip.Trigger, 'button');
const Trigger = React.forwardRef<HTMLElement, PartProps<typeof BaseTooltip.Trigger>>(function Trigger({ delay, id, ...props }, ref) {
  const settings = React.useContext(Settings);
  return (
    <NativeTrigger
      {...props}
      id={id ?? settings.triggerId}
      aria-describedby={[props['aria-describedby'], settings.open ? settings.contentId : undefined].filter(Boolean).join(' ') || undefined}
      ref={ref}
      delay={delay ?? settings.delay}
    />
  );
});
const Popup = part(BaseTooltip.Popup, 'div');
export interface ContentProps
  extends PartProps<typeof BaseTooltip.Popup>,
    FloatingOptions,
    Pick<SurfaceEvents, 'onEscapeKeyDown' | 'onPointerDownOutside'> {
  forceMount?: boolean;
}
const Content = React.forwardRef<HTMLDivElement, ContentProps>(function TooltipContent(
  {
    side,
    align,
    sideOffset,
    alignOffset,
    collisionBoundary,
    collisionPadding,
    avoidCollisions,
    sticky,
    hideWhenDetached: _,
    arrowPadding,
    onPlaced,
    forceMount: _force,
    onEscapeKeyDown,
    onPointerDownOutside,
    ...props
  },
  ref,
) {
  const settings = React.useContext(Settings);
  if (settings.events) settings.events.current = { onEscapeKeyDown, onPointerDownOutside };
  React.useEffect(() => {
    onPlaced?.();
  }, [onPlaced]);
  return (
    <BaseTooltip.Positioner
      {...positionProps({ side, align, sideOffset, alignOffset, collisionBoundary, collisionPadding, avoidCollisions, sticky, arrowPadding })}
      style={{ zIndex: props.style?.zIndex }}
    >
      <Popup role="tooltip" id={settings.contentId} {...props} ref={ref} />
    </BaseTooltip.Positioner>
  );
});
export interface ProviderProps {
  children?: React.ReactNode;
  delayDuration?: number;
  skipDelayDuration?: number;
  disableHoverableContent?: boolean;
}
function Provider({ delayDuration, skipDelayDuration, disableHoverableContent = false, ...props }: ProviderProps) {
  return (
    <Hoverable.Provider value={disableHoverableContent}>
      <BaseTooltip.Provider {...props} delay={delayDuration} timeout={skipDelayDuration} />
    </Hoverable.Provider>
  );
}
export interface PortalProps extends PartProps<typeof BaseTooltip.Portal> {
  forceMount?: boolean;
}
function Portal({ forceMount, keepMounted, ...props }: PortalProps) {
  return <BaseTooltip.Portal {...props} keepMounted={keepMounted ?? forceMount} />;
}
export const Tooltip = { Root, Trigger, Content, Portal, Provider };
export namespace Tooltip {
  export type TooltipProps = RootProps;
  export type TooltipContentProps = ContentProps;
  export type TooltipProviderProps = ProviderProps;
}
