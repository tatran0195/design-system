'use client';

import { ContextMenu as BaseContextMenu } from '@base-ui/react/context-menu';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import * as React from 'react';
import { type CheckedState, DirectionScope } from './controls';
import { autoFocus, Element, type PartProps, part, type SurfaceEvents, surfaceChange } from './parts';
import { type FloatingOptions, positionProps } from './popover';

// Selection cancellation must not cancel checkbox/radio value updates.
const canceledSelections = new WeakSet<Event>();
const Events = React.createContext<React.RefObject<SurfaceEvents> | null>(null);
const ContentLoop = React.createContext<React.Dispatch<React.SetStateAction<boolean | undefined>> | null>(null);
export interface RootProps extends Omit<BaseMenu.Root.Props, 'children'> {
  children?: React.ReactNode;
  dir?: 'ltr' | 'rtl';
}
function Root({ dir, children, onOpenChange, ...props }: RootProps) {
  const events = React.useRef<SurfaceEvents>({});
  const [loop, setLoop] = React.useState<boolean>();
  return (
    <DirectionScope dir={dir}>
      <ContentLoop.Provider value={setLoop}>
        <Events.Provider value={events}>
          <BaseMenu.Root
            {...props}
            loopFocus={loop ?? props.loopFocus ?? false}
            onOpenChange={(open, details) => {
              if (!open && details.reason === 'item-press' && canceledSelections.has(details.event)) details.cancel();
              surfaceChange(open, details, events.current);
              if (!details.isCanceled) onOpenChange?.(open, details);
            }}
          >
            {children}
          </BaseMenu.Root>
        </Events.Provider>
      </ContentLoop.Provider>
    </DirectionScope>
  );
}
function Sub({ children, onOpenChange, ...props }: BaseMenu.SubmenuRoot.Props) {
  const events = React.useRef<SurfaceEvents>({});
  const [loop, setLoop] = React.useState<boolean>();
  return (
    <ContentLoop.Provider value={setLoop}>
      <Events.Provider value={events}>
        <BaseMenu.SubmenuRoot
          {...props}
          loopFocus={loop ?? props.loopFocus ?? false}
          onOpenChange={(open, details) => {
            if (!open && details.reason === 'item-press' && canceledSelections.has(details.event)) details.cancel();
            surfaceChange(open, details, events.current);
            if (!details.isCanceled) onOpenChange?.(open, details);
          }}
        >
          {children}
        </BaseMenu.SubmenuRoot>
      </Events.Provider>
    </ContentLoop.Provider>
  );
}
export interface ContextProps extends Omit<BaseContextMenu.Root.Props, 'children'> {
  children?: React.ReactNode;
  dir?: 'ltr' | 'rtl';
}
function ContextRoot({ dir, children, onOpenChange, ...props }: ContextProps) {
  const events = React.useRef<SurfaceEvents>({});
  const [loop, setLoop] = React.useState<boolean>();
  return (
    <DirectionScope dir={dir}>
      <ContentLoop.Provider value={setLoop}>
        <Events.Provider value={events}>
          <BaseContextMenu.Root
            {...props}
            loopFocus={loop ?? props.loopFocus ?? false}
            onOpenChange={(open, details) => {
              if (!open && details.reason === 'item-press' && canceledSelections.has(details.event)) details.cancel();
              surfaceChange(open, details, events.current);
              if (!details.isCanceled) onOpenChange?.(open, details);
            }}
          >
            {children}
          </BaseContextMenu.Root>
        </Events.Provider>
      </ContentLoop.Provider>
    </DirectionScope>
  );
}
const Popup = part(BaseMenu.Popup, 'div');
export interface ContentProps extends PartProps<typeof BaseMenu.Popup>, FloatingOptions, SurfaceEvents {
  forceMount?: boolean;
  loop?: boolean;
  onEntryFocus?: (event: Event) => void;
}
function content(submenu = false) {
  return React.forwardRef<HTMLDivElement, ContentProps>(function MenuContent(
    {
      side = submenu ? 'inline-end' : 'bottom',
      align = submenu ? 'start' : 'center',
      sideOffset,
      alignOffset,
      collisionBoundary,
      collisionPadding,
      avoidCollisions,
      sticky,
      hideWhenDetached: _,
      arrowPadding,
      onPlaced,
      onEscapeKeyDown,
      onPointerDownOutside,
      onInteractOutside,
      onFocusOutside,
      onOpenAutoFocus: _open,
      onCloseAutoFocus,
      forceMount: _force,
      loop,
      onEntryFocus: _entry,
      finalFocus,
      ...props
    },
    ref,
  ) {
    const setLoop = React.useContext(ContentLoop);
    React.useEffect(() => {
      setLoop?.(loop);
      return () => setLoop?.(undefined);
    }, [setLoop, loop]);
    const events = React.useContext(Events);
    if (events) events.current = { onEscapeKeyDown, onPointerDownOutside, onInteractOutside, onFocusOutside };
    React.useEffect(() => {
      onPlaced?.();
    }, [onPlaced]);
    return (
      <BaseMenu.Positioner
        {...positionProps({ side, align, sideOffset, alignOffset, collisionBoundary, collisionPadding, avoidCollisions, sticky, arrowPadding })}
        style={{ zIndex: props.style?.zIndex }}
      >
        <Popup {...props} ref={ref} finalFocus={finalFocus ?? (onCloseAutoFocus ? autoFocus(onCloseAutoFocus) : undefined)} />
      </BaseMenu.Positioner>
    );
  });
}
export interface PortalProps extends PartProps<typeof BaseMenu.Portal> {
  forceMount?: boolean;
}
function Portal({ forceMount, keepMounted, ...props }: PortalProps) {
  return <BaseMenu.Portal {...props} keepMounted={keepMounted ?? forceMount} />;
}
const IndicatorContext = React.createContext<'checkbox' | 'radio' | 'indeterminate'>('checkbox');
const CheckboxIndicator = part(BaseMenu.CheckboxItemIndicator, 'span');
const RadioIndicator = part(BaseMenu.RadioItemIndicator, 'span');
const ItemIndicator = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement> & { forceMount?: boolean }>(function Indicator(
  { forceMount, ...props },
  ref,
) {
  const kind = React.useContext(IndicatorContext);
  return kind === 'radio' ? (
    <RadioIndicator {...props} keepMounted={forceMount} ref={ref} />
  ) : (
    <CheckboxIndicator
      {...props}
      {...(kind === 'indeterminate' ? { hidden: false } : {})}
      keepMounted={forceMount || kind === 'indeterminate'}
      ref={ref}
    />
  );
});
export type SelectHandler = (event: Event) => void;
function selected(event: React.MouseEvent, handler?: SelectHandler) {
  if (event.defaultPrevented) return;
  const select = new CustomEvent('cms.itemSelect', { cancelable: true, bubbles: true });
  if (handler) event.currentTarget.addEventListener('cms.itemSelect', handler, { once: true });
  event.currentTarget.dispatchEvent(select);
  if (select.defaultPrevented) canceledSelections.add(event.nativeEvent);
}
const NativeItem = part(BaseMenu.Item, 'div');
export interface ItemProps extends Omit<PartProps<typeof BaseMenu.Item>, 'onSelect'> {
  onSelect?: SelectHandler;
  textValue?: string;
}
const Item = React.forwardRef<HTMLElement, ItemProps>(function Item({ onSelect, onClick, textValue, label, ...props }, ref) {
  return (
    <NativeItem
      {...props}
      ref={ref}
      label={label ?? textValue}
      onClick={(event) => {
        onClick?.(event);
        selected(event, onSelect);
      }}
    />
  );
});
const NativeCheckbox = part(BaseMenu.CheckboxItem, 'div');
export interface CheckboxProps extends Omit<PartProps<typeof BaseMenu.CheckboxItem>, 'checked' | 'defaultChecked' | 'onCheckedChange' | 'onSelect'> {
  checked?: CheckedState;
  defaultChecked?: CheckedState;
  onCheckedChange?: (value: boolean) => void;
  onSelect?: SelectHandler;
  textValue?: string;
}
const CheckboxItem = React.forwardRef<HTMLElement, CheckboxProps>(function CheckboxItem(
  { onSelect, onClick, textValue, label, checked, defaultChecked, onCheckedChange, closeOnClick = true, ...props },
  ref,
) {
  return (
    <IndicatorContext.Provider value={checked === 'indeterminate' ? 'indeterminate' : 'checkbox'}>
      <NativeCheckbox
        {...props}
        closeOnClick={closeOnClick}
        ref={ref}
        label={label ?? textValue}
        checked={checked === undefined ? undefined : checked === true}
        defaultChecked={defaultChecked === true}
        {...(checked === 'indeterminate' ? { 'aria-checked': 'mixed' as const } : {})}
        onCheckedChange={(value) => onCheckedChange?.(value)}
        onClick={(event) => {
          onClick?.(event);
          selected(event, onSelect);
        }}
      />
    </IndicatorContext.Provider>
  );
});
const NativeRadio = part(BaseMenu.RadioItem, 'div');
export interface RadioProps extends Omit<PartProps<typeof BaseMenu.RadioItem>, 'onSelect'> {
  onSelect?: SelectHandler;
  textValue?: string;
}
const RadioItem = React.forwardRef<HTMLElement, RadioProps>(function RadioItem(
  { onSelect, onClick, textValue, label, closeOnClick = true, ...props },
  ref,
) {
  return (
    <IndicatorContext.Provider value="radio">
      <NativeRadio
        {...props}
        closeOnClick={closeOnClick}
        ref={ref}
        label={label ?? textValue}
        onClick={(event) => {
          onClick?.(event);
          selected(event, onSelect);
        }}
      />
    </IndicatorContext.Provider>
  );
});
Root.displayName = 'Menu.Root';
ContextRoot.displayName = 'ContextMenu.Root';
Sub.displayName = 'Menu.Sub';
Portal.displayName = 'Menu.Portal';
// A CMS menu label may stand alone, whereas Base UI's GroupLabel requires a group.
const HasGroup = React.createContext(false);
const NativeGroup = part(BaseMenu.Group, 'div');
const NativeRadioGroup = part(BaseMenu.RadioGroup, 'div');
const NativeLabel = part(BaseMenu.GroupLabel, 'div');
const Group = React.forwardRef<HTMLDivElement, PartProps<typeof BaseMenu.Group>>(function Group(props, ref) {
  return (
    <HasGroup.Provider value>
      <NativeGroup {...props} ref={ref} />
    </HasGroup.Provider>
  );
});
const RadioGroup = React.forwardRef<
  HTMLDivElement,
  Omit<PartProps<typeof BaseMenu.RadioGroup>, 'value' | 'onValueChange'> & { value?: string; onValueChange?: (value: string) => void }
>(function RadioGroup({ onValueChange, ...props }, ref) {
  return (
    <HasGroup.Provider value>
      <NativeRadioGroup {...props} ref={ref} onValueChange={(value) => onValueChange?.(String(value))} />
    </HasGroup.Provider>
  );
});
const Label = React.forwardRef<HTMLDivElement, PartProps<typeof BaseMenu.GroupLabel>>(function Label(props, ref) {
  return React.useContext(HasGroup) ? <NativeLabel {...props} ref={ref} /> : <Element {...props} ref={ref} />;
});
export const DropdownMenu = {
  Root,
  Trigger: part(BaseMenu.Trigger, 'button'),
  Group,
  Sub,
  SubTrigger: part(BaseMenu.SubmenuTrigger, 'div'),
  SubContent: content(true),
  Content: content(),
  Portal,
  Item,
  CheckboxItem,
  RadioItem,
  ItemIndicator,
  RadioGroup,
  Label,
  Separator: part(BaseMenu.Separator, 'div'),
};
export const ContextMenu = { ...DropdownMenu, Root: ContextRoot, Trigger: part(BaseContextMenu.Trigger, 'span') };
