import * as React from 'react';
import { Popover as PopoverPrimitive } from '@/primitives/popover';
import { clx } from '@/utils/clx';
import { UiLayer } from '@/utils/layers';

/**
 * This component is based on the [Base UI Popover](https://base-ui.com/react/components/popover) primitves.
 */
const Root = (props: React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root>) => <PopoverPrimitive.Root {...props} />;
Root.displayName = 'Popover';

interface TriggerProps extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger> {}
const Trigger = React.forwardRef<React.ComponentRef<typeof PopoverPrimitive.Trigger>, TriggerProps>((props, ref) => (
  <PopoverPrimitive.Trigger ref={ref} {...props} />
));
Trigger.displayName = 'Popover.Trigger';

const Anchor = React.forwardRef<React.ComponentRef<typeof PopoverPrimitive.Anchor>, React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Anchor>>(
  (props, ref) => <PopoverPrimitive.Anchor ref={ref} {...props} />,
);
Anchor.displayName = 'Popover.Anchor';

const Close = React.forwardRef<React.ComponentRef<typeof PopoverPrimitive.Close>, React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Close>>(
  (props, ref) => <PopoverPrimitive.Close ref={ref} {...props} />,
);
Close.displayName = 'Popover.Close';

interface ContentProps extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> {}

/**
 * @excludeExternal
 */
const Content = React.forwardRef<React.ComponentRef<typeof PopoverPrimitive.Content>, ContentProps>(
  (
    {
      className,
      /**
       * The distance in pixels from the anchor.
       */
      sideOffset = 8,
      /**
       * The preferred side of the anchor to render against when open.
       * Will be reversed when collisions occur and `avoidCollisions` is enabled.
       */
      side = 'bottom',
      /**
       * The preferred alignment against the anchor. May change when collisions occur.
       */
      align = 'start',
      collisionPadding,
      ...props
    }: ContentProps,
    ref,
  ) => (
    <UiLayer kind="popover" zIndex={props.style?.zIndex}>
      {(layer) => (
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            ref={ref}
            sideOffset={sideOffset}
            side={side}
            align={align}
            collisionPadding={collisionPadding}
            className={clx(
              'bg-ui-bg-base text-ui-fg-base shadow-elevation-flyout max-h-[var(--available-height)] min-w-[220px] overflow-hidden rounded-lg p-1',
              'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
              className,
            )}
            {...props}
            style={{ ...props.style, zIndex: layer }}
            data-ui-layer="popover"
          />
        </PopoverPrimitive.Portal>
      )}
    </UiLayer>
  ),
);
Content.displayName = 'Popover.Content';

const Seperator = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(({ className, ...props }, ref) => (
  <div ref={ref} className={clx('bg-ui-border-base -mx-1 my-1 h-px', className)} {...props} />
));
Seperator.displayName = 'Popover.Seperator';

const Popover: typeof Root & {
  Trigger: typeof Trigger;
  Anchor: typeof Anchor;
  Close: typeof Close;
  Content: typeof Content;
  Seperator: typeof Seperator;
} = Object.assign(Root, {
  Trigger,
  Anchor,
  Close,
  Content,
  Seperator,
});

export { Popover };
