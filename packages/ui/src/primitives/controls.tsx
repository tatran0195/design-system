'use client';

import { Avatar as BaseAvatar } from '@base-ui/react/avatar';
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { DirectionProvider, useDirection } from '@base-ui/react/direction-provider';
import { Radio as BaseRadio } from '@base-ui/react/radio';
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group';
import { Switch as BaseSwitch } from '@base-ui/react/switch';
import * as React from 'react';
import { type PartProps, part } from './parts';

export function DirectionScope({ dir, children }: { dir?: 'ltr' | 'rtl'; children: React.ReactNode }) {
  const inherited = useDirection();
  return <DirectionProvider direction={dir ?? inherited}>{children}</DirectionProvider>;
}
export type CheckedState = boolean | 'indeterminate';
export interface CheckboxProps extends Omit<PartProps<typeof BaseCheckbox.Root>, 'checked' | 'defaultChecked' | 'onCheckedChange'> {
  checked?: CheckedState;
  defaultChecked?: CheckedState;
  onCheckedChange?: (checked: CheckedState) => void;
}
const NativeCheckbox = part<typeof BaseCheckbox.Root, HTMLButtonElement>(BaseCheckbox.Root, 'button');
const CheckboxRoot = React.forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(
  { checked, defaultChecked, onCheckedChange, ...props },
  ref,
) {
  const [initialMixed, setInitialMixed] = React.useState(defaultChecked === 'indeterminate');
  return (
    <NativeCheckbox
      {...props}
      ref={ref}
      nativeButton
      checked={checked === undefined ? undefined : checked === true}
      defaultChecked={defaultChecked === true}
      indeterminate={checked === 'indeterminate' || (checked === undefined && initialMixed)}
      onCheckedChange={(next) => {
        setInitialMixed(false);
        onCheckedChange?.(next);
      }}
    />
  );
});
export const Checkbox = { Root: CheckboxRoot, Indicator: part(BaseCheckbox.Indicator, 'span') };
const NativeSwitch = part<typeof BaseSwitch.Root, HTMLButtonElement>(BaseSwitch.Root, 'button');
const SwitchRoot = React.forwardRef<HTMLButtonElement, PartProps<typeof BaseSwitch.Root>>(function Switch(props, ref) {
  return <NativeSwitch {...props} ref={ref} nativeButton />;
});
export const Switch = { Root: SwitchRoot, Thumb: part(BaseSwitch.Thumb, 'span') };
export interface RadioProps extends Omit<PartProps<typeof BaseRadioGroup>, 'value' | 'defaultValue' | 'onValueChange'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  dir?: 'ltr' | 'rtl';
  orientation?: 'horizontal' | 'vertical';
  loop?: boolean;
}
const NativeGroup = part<typeof BaseRadioGroup, HTMLDivElement>(BaseRadioGroup, 'div');
const RadioRoot = React.forwardRef<HTMLDivElement, RadioProps>(function RadioGroup(
  { dir, orientation, loop = true, onValueChange, onKeyDown, ...props },
  ref,
) {
  const inherited = useDirection();
  const direction = dir ?? inherited;
  return (
    <DirectionScope dir={dir}>
      <NativeGroup
        {...props}
        ref={ref}
        aria-orientation={orientation}
        data-orientation={orientation}
        onValueChange={(value) => onValueChange?.(String(value))}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
          const horizontal = event.key === 'ArrowLeft' || event.key === 'ArrowRight';
          const vertical = event.key === 'ArrowUp' || event.key === 'ArrowDown';
          if (!horizontal && !vertical) return;
          if ((orientation === 'horizontal' && vertical) || (orientation === 'vertical' && horizontal)) {
            event.preventDefault();
            return;
          }
          if (!loop) {
            const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]:not([disabled]):not([data-disabled])'));
            const active = event.currentTarget.ownerDocument.activeElement;
            const forward = vertical ? event.key === 'ArrowDown' : event.key === (direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight');
            if (active === items[forward ? items.length - 1 : 0]) event.preventDefault();
          }
        }}
      />
    </DirectionScope>
  );
});
const NativeRadio = part<typeof BaseRadio.Root, HTMLButtonElement>(BaseRadio.Root, 'button');
const RadioItem = React.forwardRef<HTMLButtonElement, PartProps<typeof BaseRadio.Root>>(function Radio(props, ref) {
  return <NativeRadio {...props} nativeButton ref={ref} />;
});
export const RadioGroup = { Root: RadioRoot, Item: RadioItem, Indicator: part(BaseRadio.Indicator, 'span') };
export const Avatar = { Root: part(BaseAvatar.Root, 'span'), Image: part(BaseAvatar.Image, 'img'), Fallback: part(BaseAvatar.Fallback, 'span') };
