'use client';

import { Select as BaseSelect } from '@base-ui/react/select';
import * as React from 'react';
import { DirectionScope } from './controls';
import { autoFocus, type PartProps, part, type SurfaceEvents, surfaceChange } from './parts';
import { type FloatingOptions, positionProps } from './popover';

export interface RootProps extends Omit<BaseSelect.Root.Props<string, false>, 'value' | 'defaultValue' | 'onValueChange'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  dir?: 'ltr' | 'rtl';
}
const Events = React.createContext<React.RefObject<SurfaceEvents> | null>(null);
function optionLabels(children: React.ReactNode, result: Record<string, React.ReactNode> = {}) {
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement<{ value?: string; children?: React.ReactNode }>(child)) return;
    const name =
      typeof child.type === 'function' || typeof child.type === 'object' ? (child.type as { displayName?: string }).displayName : undefined;
    if (name === 'Select.Item' && child.props.value !== undefined) result[child.props.value] = child.props.children;
    else if (child.props.children) optionLabels(child.props.children, result);
  });
  return result;
}
function Root({ dir, value, defaultValue, onValueChange, onOpenChange, children, items, ...props }: RootProps) {
  const events = React.useRef<SurfaceEvents>({});
  const labels = React.useMemo(() => items ?? optionLabels(children), [items, children]);
  return (
    <DirectionScope dir={dir}>
      <Events.Provider value={events}>
        <BaseSelect.Root
          {...props}
          items={labels}
          value={value === '' ? null : value}
          defaultValue={defaultValue === '' ? null : defaultValue}
          onValueChange={(next) => onValueChange?.(next ?? '')}
          onOpenChange={(open, details) => {
            surfaceChange(open, details, events.current);
            if (!details.isCanceled) onOpenChange?.(open, details);
          }}
        >
          {children}
        </BaseSelect.Root>
      </Events.Provider>
    </DirectionScope>
  );
}
const Popup = part(BaseSelect.Popup, 'div');
export interface ContentProps extends PartProps<typeof BaseSelect.Popup>, FloatingOptions, SurfaceEvents {
  position?: 'popper' | 'item-aligned';
  forceMount?: boolean;
}
const Content = React.forwardRef<HTMLDivElement, ContentProps>(function Content(
  {
    position = 'popper',
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
    onEscapeKeyDown,
    onPointerDownOutside,
    onFocusOutside,
    onInteractOutside,
    onOpenAutoFocus: _open,
    onCloseAutoFocus,
    forceMount: _force,
    finalFocus,
    ...props
  },
  ref,
) {
  const events = React.useContext(Events);
  if (events) events.current = { onEscapeKeyDown, onPointerDownOutside, onFocusOutside, onInteractOutside };
  React.useEffect(() => {
    onPlaced?.();
  }, [onPlaced]);
  return (
    <BaseSelect.Positioner
      {...positionProps({ side, align, sideOffset, alignOffset, collisionBoundary, collisionPadding, avoidCollisions, sticky, arrowPadding })}
      alignItemWithTrigger={position === 'item-aligned'}
      style={{ zIndex: props.style?.zIndex }}
    >
      <Popup {...props} ref={ref} finalFocus={finalFocus ?? (onCloseAutoFocus ? autoFocus(onCloseAutoFocus) : undefined)} />
    </BaseSelect.Positioner>
  );
});
function Portal(props: PartProps<typeof BaseSelect.Portal>) {
  return <BaseSelect.Portal {...props} />;
}
const NativeItem = part(BaseSelect.Item, 'div');
export interface ItemProps extends Omit<PartProps<typeof BaseSelect.Item>, 'value'> {
  value: string;
  textValue?: string;
  id?: string;
}
const Item = React.forwardRef<HTMLElement, ItemProps>(function Item({ textValue, label, ...props }, ref) {
  return <NativeItem {...props} ref={ref} label={label ?? textValue} />;
});
export const Select = {
  Root,
  Trigger: part(BaseSelect.Trigger, 'button'),
  Value: part(BaseSelect.Value, 'span'),
  Icon: part(BaseSelect.Icon, 'span'),
  Portal,
  Content,
  Viewport: part(BaseSelect.List, 'div'),
  Group: part(BaseSelect.Group, 'div'),
  Label: part(BaseSelect.GroupLabel, 'div'),
  Item,
  ItemText: part(BaseSelect.ItemText, 'span'),
  ItemIndicator: part(BaseSelect.ItemIndicator, 'span'),
  Separator: part(BaseSelect.Separator, 'div'),
};
