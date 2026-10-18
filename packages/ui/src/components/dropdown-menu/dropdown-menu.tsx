'use client';

import { CheckMini, ChevronRightMini, EllipseMiniSolid } from '@cms/icons';
import * as React from 'react';
import { DropdownMenu as DropdownMenuPrimitive } from '@/primitives/menu';
import { clx } from '@/utils/clx';
import { UiLayer } from '@/utils/layers';

/**
 * This component is based on the [Base UI Dropdown Menu](https://base-ui.com/react/components/dropdown-menu) primitive.
 */
const Root = DropdownMenuPrimitive.Root;
Root.displayName = 'DropdownMenu';

/**
 * This component is based on the [Base UI Dropdown Menu Trigger](https://base-ui.com/react/components/dropdown-menu#trigger) primitive.
 */
const Trigger = DropdownMenuPrimitive.Trigger;
Trigger.displayName = 'DropdownMenu.Trigger';

/**
 * This component is based on the [Base UI Dropdown Menu Group](https://base-ui.com/react/components/dropdown-menu#group) primitive.
 */
const Group = DropdownMenuPrimitive.Group;
Group.displayName = 'DropdownMenu.Group';

/**
 * This component is based on the [Base UI Dropdown Menu Sub](https://base-ui.com/react/components/dropdown-menu#sub) primitive.
 */
const SubMenu = DropdownMenuPrimitive.Sub;
SubMenu.displayName = 'DropdownMenu.SubMenu';

/**
 * This component is based on the [Base UI Dropdown Menu RadioGroup](https://base-ui.com/react/components/dropdown-menu#radiogroup) primitive.
 */
const RadioGroup = DropdownMenuPrimitive.RadioGroup;
RadioGroup.displayName = 'DropdownMenu.RadioGroup';

/**
 * This component is based on the [Base UI Dropdown Menu SubTrigger](https://base-ui.com/react/components/dropdown-menu#subtrigger) primitive.
 */
const SubMenuTrigger = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={clx(
      'bg-ui-bg-component text-ui-fg-base txt-compact-small relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 outline-none transition-colors',
      'focus-visible:bg-ui-bg-component-hover focus:bg-ui-bg-component-hover',
      'active:bg-ui-bg-component-hover',
      'data-[disabled]:text-ui-fg-disabled data-[disabled]:pointer-events-none',
      'data-[state=open]:!bg-ui-bg-component-hover',
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRightMini className="text-ui-fg-muted ml-auto" />
  </DropdownMenuPrimitive.SubTrigger>
));
SubMenuTrigger.displayName = 'DropdownMenu.SubMenuTrigger';

/**
 * This component is based on the [Base UI Dropdown Menu SubContent](https://base-ui.com/react/components/dropdown-menu#subcontent) primitive.
 */
const SubMenuContent = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, collisionPadding = 8, ...props }, ref) => (
  <UiLayer kind="popover" zIndex={props.style?.zIndex}>
    {(layer) => (
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.SubContent
          ref={ref}
          collisionPadding={collisionPadding}
          className={clx(
            'bg-ui-bg-component text-ui-fg-base shadow-elevation-flyout max-h-[var(--available-height)] min-w-[220px] overflow-hidden rounded-lg p-1',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            className,
          )}
          {...props}
          style={{ ...props.style, zIndex: layer }}
          data-ui-layer="popover"
        />
      </DropdownMenuPrimitive.Portal>
    )}
  </UiLayer>
));
SubMenuContent.displayName = 'DropdownMenu.SubMenuContent';

/**
 * This component is based on the [Base UI Dropdown Menu Content](https://base-ui.com/react/components/dropdown-menu#content) primitive.
 */
const Content = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(
  (
    {
      className,
      /**
       * The space in pixels between the dropdown menu and its trigger element.
       */
      sideOffset = 8,
      /**
       * The distance in pixels from the boundary edges where collision detection should occur.
       */
      collisionPadding = 8,
      /**
       * The alignment of the dropdown menu relative to its trigger element.
       *
       * @defaultValue center
       */
      align = 'center',
      ...props
    },
    ref,
  ) => (
    <UiLayer kind="popover" zIndex={props.style?.zIndex}>
      {(layer) => (
        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.Content
            ref={ref}
            sideOffset={sideOffset}
            align={align}
            collisionPadding={collisionPadding}
            className={clx(
              'bg-ui-bg-component text-ui-fg-base shadow-elevation-flyout max-h-[var(--available-height)] min-w-[220px] overflow-hidden rounded-lg p-1',
              'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
              className,
            )}
            {...props}
            style={{ ...props.style, zIndex: layer }}
            data-ui-layer="popover"
          />
        </DropdownMenuPrimitive.Portal>
      )}
    </UiLayer>
  ),
);
Content.displayName = 'DropdownMenu.Content';

/**
 * This component is based on the [Base UI Dropdown Menu Item](https://base-ui.com/react/components/dropdown-menu#item) primitive.
 */
const Item = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={clx(
      'bg-ui-bg-component text-ui-fg-base txt-compact-small relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 outline-none transition-colors',
      'focus-visible:bg-ui-bg-component-hover focus:bg-ui-bg-component-hover',
      'active:bg-ui-bg-component-hover',
      'data-[disabled]:text-ui-fg-disabled data-[disabled]:pointer-events-none',
      className,
    )}
    {...props}
  />
));
Item.displayName = 'DropdownMenu.Item';

/**
 * This component is based on the [Base UI Dropdown Menu CheckboxItem](https://base-ui.com/react/components/dropdown-menu#checkboxitem) primitive.
 */
const CheckboxItem = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={clx(
      'bg-ui-bg-component text-ui-fg-base txt-compact-small relative flex cursor-pointer select-none items-center rounded-md py-1.5 ps-[31px] pe-2 outline-none transition-colors',
      'focus-visible:bg-ui-bg-component-hover focus:bg-ui-bg-component-hover',
      'active:bg-ui-bg-component-hover',
      'data-[disabled]:text-ui-fg-disabled data-[disabled]:pointer-events-none',
      'data-[state=checked]:txt-compact-small-plus',
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute start-2 flex size-[15px] items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <CheckMini />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));
CheckboxItem.displayName = 'DropdownMenu.CheckboxItem';

/**
 * This component is based on the [Base UI Dropdown Menu RadioItem](https://base-ui.com/react/components/dropdown-menu#radioitem) primitive.
 */
const RadioItem = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={clx(
      'bg-ui-bg-component txt-compact-small relative flex cursor-pointer select-none items-center rounded-md py-1.5 ps-[31px] pe-2 outline-none transition-colors',
      'focus-visible:bg-ui-bg-component-hover focus:bg-ui-bg-component-hover',
      'active:bg-ui-bg-component-hover',
      'data-[disabled]:text-ui-fg-disabled data-[disabled]:pointer-events-none',
      'data-[state=checked]:txt-compact-small-plus',
      className,
    )}
    {...props}
  >
    <span className="absolute start-2 flex size-[15px] items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <EllipseMiniSolid className="text-ui-fg-base" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
));
RadioItem.displayName = 'DropdownMenu.RadioItem';

/**
 * This component is based on the [Base UI Dropdown Menu Label](https://base-ui.com/react/components/dropdown-menu#label) primitive.
 */
const Label = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Label ref={ref} className={clx('text-ui-fg-subtle txt-compact-xsmall-plus', className)} {...props} />
));
Label.displayName = 'DropdownMenu.Label';

/**
 * This component is based on the [Base UI Dropdown Menu Separator](https://base-ui.com/react/components/dropdown-menu#separator) primitive.
 */
const Separator = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={clx('bg-ui-border-component border-t-ui-border-menu-top border-b-ui-border-menu-bot -mx-1 my-1 h-0.5 border-b border-t', className)}
    {...props}
  />
));
Separator.displayName = 'DropdownMenu.Separator';

/**
 * This component is based on the `span` element and supports all of its props
 */
const Shortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={clx('text-ui-fg-subtle txt-compact-small ml-auto tracking-widest', className)} {...props} />
);
Shortcut.displayName = 'DropdownMenu.Shortcut';

/**
 * This component is based on the `span` element and supports all of its props
 */
const Hint = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={clx('text-ui-fg-subtle txt-compact-small ml-auto tracking-widest', className)} {...props} />
);
Hint.displayName = 'DropdownMenu.Hint';

const DropdownMenu = Object.assign(Root, {
  Trigger,
  Group,
  SubMenu,
  SubMenuContent,
  SubMenuTrigger,
  Content,
  Item,
  CheckboxItem,
  RadioGroup,
  RadioItem,
  Label,
  Separator,
  Shortcut,
  Hint,
});

export { DropdownMenu };
