'use client';

import { CheckMini, ChevronRightMini, EllipseMiniSolid } from '@cms/icons';
import * as React from 'react';
import { ContextMenu as ContextMenuPrimitive } from '@/primitives/menu';
import { clx } from '@/utils/clx';
import { UiLayer } from '@/utils/layers';

/**
 * This component is based on the [Base UI Context Menu](https://base-ui.com/react/components/context-menu) primitive.
 */
const Root = ContextMenuPrimitive.Root;
Root.displayName = 'ContextMenu';

/**
 * This component is based on the [Base UI Context Menu Trigger](https://base-ui.com/react/components/context-menu#trigger) primitive.
 */
const Trigger = ContextMenuPrimitive.Trigger;
Trigger.displayName = 'ContextMenu.Trigger';

/**
 * This component is based on the [Base UI Context Menu Group](https://base-ui.com/react/components/context-menu#group) primitive.
 */
const Group = ContextMenuPrimitive.Group;
Group.displayName = 'ContextMenu.Group';

/**
 * This component is based on the [Base UI Context Menu Portal](https://base-ui.com/react/components/context-menu#portal) primitive.
 */
const Portal = ContextMenuPrimitive.Portal;
Portal.displayName = 'ContextMenu.Portal';

/**
 * This component is based on the [Base UI Context Menu Sub](https://base-ui.com/react/components/context-menu#sub) primitive.
 */
const SubMenu = ContextMenuPrimitive.Sub;
SubMenu.displayName = 'ContextMenu.SubMenu';

/**
 * This component is based on the [Base UI Context Menu RadioGroup](https://base-ui.com/react/components/context-menu#radiogroup) primitive.
 */
const RadioGroup = ContextMenuPrimitive.RadioGroup;
RadioGroup.displayName = 'ContextMenu.RadioGroup';

/**
 * This component is based on the [Base UI Context Menu SubTrigger](https://base-ui.com/react/components/context-menu#subtrigger) primitive.
 */
const SubMenuTrigger = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger>
>(({ className, children, ...props }, ref) => (
  <ContextMenuPrimitive.SubTrigger
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
  </ContextMenuPrimitive.SubTrigger>
));
SubMenuTrigger.displayName = 'ContextMenu.SubMenuTrigger';

/**
 * This component is based on the [Base UI Context Menu SubContent](https://base-ui.com/react/components/context-menu#subcontent) primitive.
 */
const SubMenuContent = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>
>(({ className, collisionPadding = 8, ...props }, ref) => (
  <UiLayer kind="popover" zIndex={props.style?.zIndex}>
    {(layer) => (
      <ContextMenuPrimitive.Portal>
        <ContextMenuPrimitive.SubContent
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
      </ContextMenuPrimitive.Portal>
    )}
  </UiLayer>
));
SubMenuContent.displayName = 'ContextMenu.SubMenuContent';

/**
 * This component is based on the [Base UI Context Menu Content](https://base-ui.com/react/components/context-menu#content) primitive.
 */
const Content = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(({ className, collisionPadding = 8, ...props }, ref) => (
  <UiLayer kind="popover" zIndex={props.style?.zIndex}>
    {(layer) => (
      <ContextMenuPrimitive.Portal>
        <ContextMenuPrimitive.Content
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
      </ContextMenuPrimitive.Portal>
    )}
  </UiLayer>
));
Content.displayName = 'ContextMenu.Content';

/**
 * This component is based on the [Base UI Context Menu Item](https://base-ui.com/react/components/context-menu#item) primitive.
 */
const Item = React.forwardRef<React.ComponentRef<typeof ContextMenuPrimitive.Item>, React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item>>(
  ({ className, ...props }, ref) => (
    <ContextMenuPrimitive.Item
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
  ),
);
Item.displayName = 'ContextMenu.Item';

/**
 * This component is based on the [Base UI Context Menu CheckboxItem](https://base-ui.com/react/components/context-menu#checkboxitem) primitive.
 */
const CheckboxItem = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <ContextMenuPrimitive.CheckboxItem
    ref={ref}
    className={clx(
      'bg-ui-bg-component text-ui-fg-base txt-compact-small relative flex cursor-pointer select-none items-center rounded-md py-1.5 pl-[31px] pr-2 outline-none transition-colors',
      'focus-visible:bg-ui-bg-component-hover focus:bg-ui-bg-component-hover',
      'active:bg-ui-bg-component-hover',
      'data-[disabled]:text-ui-fg-disabled data-[disabled]:pointer-events-none',
      'data-[state=checked]:txt-compact-small-plus',
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex size-[15px] items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <CheckMini />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.CheckboxItem>
));
CheckboxItem.displayName = 'ContextMenu.CheckboxItem';

/**
 * This component is based on the [Base UI Context Menu RadioItem](https://base-ui.com/react/components/context-menu#radioitem) primitive.
 */
const RadioItem = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <ContextMenuPrimitive.RadioItem
    ref={ref}
    className={clx(
      'bg-ui-bg-component txt-compact-small relative flex cursor-pointer select-none items-center rounded-md py-1.5 pl-[31px] pr-2 outline-none transition-colors',
      'focus-visible:bg-ui-bg-component-hover focus:bg-ui-bg-component-hover',
      'active:bg-ui-bg-component-hover',
      'data-[disabled]:text-ui-fg-disabled data-[disabled]:pointer-events-none',
      'data-[state=checked]:txt-compact-small-plus',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex size-[15px] items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <EllipseMiniSolid className="text-ui-fg-base" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.RadioItem>
));
RadioItem.displayName = 'ContextMenu.RadioItem';

/**
 * This component is based on the [Base UI Context Menu Label](https://base-ui.com/react/components/context-menu#label) primitive.
 */
const Label = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Label ref={ref} className={clx('text-ui-fg-subtle txt-compact-xsmall-plus', className)} {...props} />
));
Label.displayName = 'ContextMenu.Label';

/**
 * This component is based on the [Base UI Context Menu Separator](https://base-ui.com/react/components/context-menu#separator) primitive.
 */
const Separator = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Separator
    ref={ref}
    className={clx('bg-ui-border-component border-t-ui-border-menu-top border-b-ui-border-menu-bot -mx-1 my-1 h-0.5 border-b border-t', className)}
    {...props}
  />
));
Separator.displayName = 'ContextMenu.Separator';

/**
 * This component is based on the `span` element and supports all of its props
 */
const Shortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={clx('text-ui-fg-subtle txt-compact-small ml-auto tracking-widest', className)} {...props} />
);
Shortcut.displayName = 'ContextMenu.Shortcut';

/**
 * This component is based on the `span` element and supports all of its props
 */
const Hint = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={clx('text-ui-fg-subtle txt-compact-small ml-auto tracking-widest', className)} {...props} />
);
Hint.displayName = 'ContextMenu.Hint';

const ContextMenu = Object.assign(Root, {
  Trigger,
  Group,
  Portal,
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

export {
  CheckboxItem as ContextMenuCheckboxItem,
  Content as ContextMenuContent,
  ContextMenu,
  Group as ContextMenuGroup,
  Hint as ContextMenuHint,
  Item as ContextMenuItem,
  Label as ContextMenuLabel,
  Portal as ContextMenuPortal,
  RadioGroup as ContextMenuRadioGroup,
  RadioItem as ContextMenuRadioItem,
  Root as ContextMenuRoot,
  Separator as ContextMenuSeparator,
  Shortcut as ContextMenuShortcut,
  SubMenu as ContextMenuSub,
  SubMenuContent as ContextMenuSubContent,
  SubMenuTrigger as ContextMenuSubTrigger,
  Trigger as ContextMenuTrigger,
};
