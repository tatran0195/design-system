'use client';

import type * as React from 'react';
import { Tooltip as TooltipPrimitive } from '@/primitives/tooltip';
import { clx } from '@/utils/clx';
import { UiLayer } from '@/utils/layers';

interface TooltipProps
  extends Omit<TooltipPrimitive.TooltipContentProps, 'content' | 'onClick'>,
    Pick<TooltipPrimitive.TooltipProps, 'open' | 'defaultOpen' | 'onOpenChange' | 'delayDuration'> {
  content: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  side?: 'bottom' | 'left' | 'top' | 'right';
  maxWidth?: number;
}

/**
 * This component is based on the [Base UI Tooltip](https://base-ui.com/react/components/tooltip) primitive.
 *
 * @excludeExternal
 */
const Tooltip = ({
  /**
   * The element to trigger the tooltip.
   *
   * @keep
   */
  children,
  /**
   * The content to display in the tooltip.
   */
  content,
  /**
   * Whether the tooltip is currently open.
   *
   * @keep
   */
  open,
  /**
   * Whether the tooltip is open by default.
   *
   * @keep
   */
  defaultOpen,
  /**
   * A function that is called when the tooltip's open state changes.
   *
   * @keep
   */
  onOpenChange,
  /**
   * The time in milliseconds to delay the tooltip's appearance.
   *
   * @keep
   */
  delayDuration,
  /**
   * The maximum width of the tooltip.
   */
  maxWidth = 220,
  className,
  /**
   * The side to position the tooltip.
   *
   * @defaultValue top
   */
  side,
  /**
   * The distance in pixels between the tooltip and its trigger.
   *
   * @keep
   */
  sideOffset = 8,
  /**
   * A function that is triggered when the tooltip is clicked.
   */
  onClick,
  ...props
}: TooltipProps) => (
  <TooltipPrimitive.Root contentId={props.id} open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} delayDuration={delayDuration}>
    <TooltipPrimitive.Trigger onClick={onClick} asChild>
      {children}
    </TooltipPrimitive.Trigger>
    <UiLayer kind="tooltip" zIndex={props.style?.zIndex}>
      {(layer) => (
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={sideOffset}
            align="center"
            className={clx(
              'txt-compact-xsmall text-ui-fg-subtle bg-ui-bg-base shadow-elevation-tooltip rounded-lg px-2.5 py-1',
              'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
              className,
            )}
            {...props}
            style={{ ...props.style, zIndex: layer, maxWidth }}
            data-ui-layer="tooltip"
          >
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      )}
    </UiLayer>
  </TooltipPrimitive.Root>
);

interface TooltipProviderProps extends TooltipPrimitive.TooltipProviderProps {}

const TooltipProvider = ({ children, delayDuration = 100, skipDelayDuration = 300, ...props }: TooltipProviderProps) => (
  <TooltipPrimitive.Provider delayDuration={delayDuration} skipDelayDuration={skipDelayDuration} {...props}>
    {children}
  </TooltipPrimitive.Provider>
);

export { Tooltip, TooltipProvider };
