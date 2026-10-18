'use client';

import { Check, TrianglesMini } from '@cms/icons';
import { cva } from 'cva';
import * as React from 'react';
import { Select as SelectPrimitive } from '@/primitives/select';
import { clx } from '@/utils/clx';
import { UiLayer } from '@/utils/layers';

interface SelectProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root> {
  size?: 'base' | 'small';
}

type SelectContextValue = {
  size: 'base' | 'small';
};

const SelectContext = React.createContext<SelectContextValue | null>(null);

const useSelectContext = () => {
  const context = React.useContext(SelectContext);

  if (context === null) {
    throw new Error('useSelectContext must be used within a SelectProvider');
  }

  return context;
};

/**
 * This component is based on [Base UI Select](https://base-ui.com/react/components/select).
 * It also accepts all props of the HTML `select` component.
 */
const Root = ({
  children,
  /**
   * The select's size.
   */
  size = 'base',
  ...props
}: SelectProps) => (
  <SelectContext.Provider value={React.useMemo(() => ({ size }), [size])}>
    <SelectPrimitive.Root {...props}>{children}</SelectPrimitive.Root>
  </SelectContext.Provider>
);
Root.displayName = 'Select';

/**
 * Groups multiple items together.
 */
const Group = SelectPrimitive.Group;
Group.displayName = 'Select.Group';

/**
 * Displays the selected value, or a placeholder if no value is selected.
 * It's based on [Base UI Select Value](https://base-ui.com/react/components/select#value).
 */
const Value = SelectPrimitive.Value;
Value.displayName = 'Select.Value';

const triggerVariants = cva({
  base: clx(
    'ui-control-text bg-ui-bg-field shadow-buttons-neutral transition-fg flex w-full select-none items-center justify-between rounded-md outline-none',
    'data-[placeholder]:text-ui-fg-muted text-ui-fg-base',
    'hover:bg-ui-bg-field-hover',
    'focus-visible:shadow-borders-interactive-with-active data-[state=open]:!shadow-borders-interactive-with-active',
    'aria-[invalid=true]:border-ui-border-error aria-[invalid=true]:shadow-borders-error',
    'invalid:border-ui-border-error invalid:shadow-borders-error',
    'disabled:!bg-ui-bg-disabled disabled:!text-ui-fg-disabled',
    'group/trigger',
  ),
  variants: {
    size: {
      base: 'h-8 px-2 py-0 txt-compact-small',
      small: 'h-7 px-2 py-0 txt-compact-small',
    },
  },
});

/**
 * The trigger that toggles the select.
 * It's based on [Base UI Select Trigger](https://base-ui.com/react/components/select#trigger).
 */
const Trigger = React.forwardRef<React.ComponentRef<typeof SelectPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>>(
  ({ className, children, ...props }, ref) => {
    const { size } = useSelectContext();

    return (
      <SelectPrimitive.Trigger ref={ref} className={clx(triggerVariants({ size }), className)} {...props}>
        {children}
        <SelectPrimitive.Icon asChild>
          <TrianglesMini className="text-ui-fg-muted group-disabled/trigger:text-ui-fg-disabled shrink-0" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
    );
  },
);
Trigger.displayName = 'Select.Trigger';

interface SelectContentProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {}

/**
 * The content that appears when the select is open.
 * It's based on [Base UI Select Content](https://base-ui.com/react/components/select#content).
 */
const Content = React.forwardRef<React.ComponentRef<typeof SelectPrimitive.Content>, SelectContentProps>(
  (
    {
      className,
      children,
      onScroll,
      /**
       * Whether to show the select items below (`popper`) or over (`item-aligned`) the select input.
       */
      position = 'popper',
      /**
       * The distance of the content pop-up in pixels from the select input. Only available when position is set to popper.
       */
      sideOffset = 8,
      /**
       * The distance in pixels from the boundary edges where collision detection should occur. Only available when position is set to popper.
       */
      collisionPadding = 24,
      ...props
    }: SelectContentProps,
    ref,
  ) => (
    <UiLayer kind="popover" zIndex={props.style?.zIndex}>
      {(layer) => (
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            ref={ref}
            className={clx(
              'bg-ui-bg-component text-ui-fg-base shadow-elevation-flyout relative max-h-[200px] min-w-[var(--anchor-width)] overflow-hidden rounded-lg',
              'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
              'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
              {
                'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1':
                  position === 'popper',
              },
              className,
            )}
            position={position}
            sideOffset={sideOffset}
            collisionPadding={collisionPadding}
            {...props}
            style={{ ...props.style, zIndex: layer }}
            data-ui-layer="popover"
          >
            <SelectPrimitive.Viewport
              className={clx(
                'max-h-[min(200px,var(--available-height))] overflow-y-auto p-1',
                position === 'popper' && 'w-full min-w-[var(--anchor-width)]',
              )}
              onScroll={onScroll}
            >
              {children}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      )}
    </UiLayer>
  ),
);
Content.displayName = 'Select.Content';

/**
 * Used to label a group of items.
 * It's based on [Base UI Select Label](https://base-ui.com/react/components/select#label).
 */
const Label = React.forwardRef<React.ComponentRef<typeof SelectPrimitive.Label>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>>(
  ({ className, ...props }, ref) => (
    <SelectPrimitive.Label ref={ref} className={clx('txt-compact-xsmall-plus text-ui-fg-muted px-2 py-1.5', className)} {...props} />
  ),
);
Label.displayName = 'Select.Label';

/**
 * An item in the select. It's based on [Base UI Select Item](https://base-ui.com/react/components/select#item)
 * and accepts its props.
 */
const Item = React.forwardRef<React.ComponentRef<typeof SelectPrimitive.Item>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>>(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
      ref={ref}
      className={clx(
        'bg-ui-bg-component txt-compact-small grid cursor-pointer grid-cols-[15px_1fr] items-center gap-x-2 rounded-[4px] px-2 py-1.5 outline-none transition-colors',
        'focus-visible:bg-ui-bg-component-hover',
        'active:bg-ui-bg-component-pressed',
        'data-[state=checked]:txt-compact-small-plus',
        'data-[disabled]:text-ui-fg-disabled',
        className,
      )}
      {...props}
    >
      <span className="flex h-[15px] w-[15px] items-center justify-center">
        <SelectPrimitive.ItemIndicator className="flex items-center justify-center">
          <Check />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText className="flex-1 truncate">{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  ),
);
Item.displayName = 'Select.Item';

const Separator = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={clx('bg-ui-border-component border-t-ui-border-menu-top border-b-ui-border-menu-bot -mx-1 my-1 h-0.5 border-b border-t', className)}
    {...props}
  />
));
Separator.displayName = 'Select.Separator';

const Select = Object.assign(Root, {
  Group,
  Value,
  Trigger,
  Content,
  Label,
  Item,
  Separator,
});

export { Select };
