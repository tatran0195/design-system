'use client';

import { Accordion as BaseAccordion } from '@base-ui/react/accordion';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import * as React from 'react';
import { DirectionScope } from './controls';
import { type PartProps, part } from './parts';

export interface TabsProps extends Omit<PartProps<typeof BaseTabs.Root>, 'value' | 'defaultValue' | 'onValueChange'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  dir?: 'ltr' | 'rtl';
  activationMode?: 'automatic' | 'manual';
}
const TabsContext = React.createContext<'automatic' | 'manual'>('automatic');
const NativeTabs = part(BaseTabs.Root, 'div');
const TabsRoot = React.forwardRef<HTMLDivElement, TabsProps>(function Tabs({ dir, activationMode = 'automatic', onValueChange, ...props }, ref) {
  return (
    <DirectionScope dir={dir}>
      <TabsContext.Provider value={activationMode}>
        <NativeTabs
          {...props}
          ref={ref}
          onValueChange={(value) => {
            if (value != null) onValueChange?.(String(value));
          }}
        />
      </TabsContext.Provider>
    </DirectionScope>
  );
});
const NativeList = part(BaseTabs.List, 'div');
const TabsList = React.forwardRef<HTMLDivElement, PartProps<typeof BaseTabs.List> & { loop?: boolean }>(function List(
  { loop, activateOnFocus, ...props },
  ref,
) {
  const activationMode = React.useContext(TabsContext);
  return <NativeList {...props} ref={ref} loopFocus={loop} activateOnFocus={activateOnFocus ?? activationMode !== 'manual'} />;
});
const NativePanel = part(BaseTabs.Panel, 'div');
const TabsContent = React.forwardRef<HTMLDivElement, PartProps<typeof BaseTabs.Panel> & { forceMount?: boolean }>(function Panel(
  { forceMount, keepMounted, ...props },
  ref,
) {
  return <NativePanel {...props} ref={ref} keepMounted={keepMounted ?? forceMount} />;
});
export const Tabs = {
  Root: TabsRoot,
  List: TabsList,
  Trigger: part<typeof BaseTabs.Tab, HTMLButtonElement>(BaseTabs.Tab, 'button'),
  Content: TabsContent,
};

export type CommonAccordionProps = Omit<PartProps<typeof BaseAccordion.Root>, 'value' | 'defaultValue' | 'onValueChange' | 'multiple'> & {
  dir?: 'ltr' | 'rtl';
  loop?: boolean;
};
export type AccordionProps = CommonAccordionProps &
  (
    | { type: 'single'; value?: string; defaultValue?: string; onValueChange?: (value: string) => void; collapsible?: boolean }
    | { type: 'multiple'; value?: string[]; defaultValue?: string[]; onValueChange?: (value: string[]) => void; collapsible?: boolean }
  );
const NativeAccordion = part<typeof BaseAccordion.Root, HTMLDivElement>(BaseAccordion.Root, 'div');
function AccordionRoot({ type, value, defaultValue, onValueChange, collapsible = false, dir, loop, ...props }: AccordionProps) {
  const multiple = type === 'multiple';
  const values = value === undefined ? undefined : Array.isArray(value) ? value : value ? [value] : [];
  const defaults = defaultValue === undefined ? undefined : Array.isArray(defaultValue) ? defaultValue : defaultValue ? [defaultValue] : [];
  return (
    <DirectionScope dir={dir}>
      <NativeAccordion
        {...props}
        loopFocus={loop ?? props.loopFocus}
        multiple={multiple}
        value={values}
        defaultValue={defaults}
        onValueChange={(value, details) => {
          const next = value as string[];
          if (!multiple && !collapsible && next.length === 0) {
            details.cancel();
            return;
          }
          if (multiple) (onValueChange as ((value: string[]) => void) | undefined)?.(next);
          else (onValueChange as ((value: string) => void) | undefined)?.(next[0] ?? '');
        }}
      />
    </DirectionScope>
  );
}
const NativeAccordionPanel = part(BaseAccordion.Panel, 'div');
const AccordionContent = React.forwardRef<HTMLDivElement, PartProps<typeof BaseAccordion.Panel> & { forceMount?: boolean }>(function Panel(
  { forceMount, keepMounted, ...props },
  ref,
) {
  return <NativeAccordionPanel {...props} keepMounted={keepMounted ?? forceMount} ref={ref} />;
});
export const Accordion = {
  Root: AccordionRoot,
  Item: part(BaseAccordion.Item, 'div'),
  Header: part(BaseAccordion.Header, 'h3'),
  Trigger: part(BaseAccordion.Trigger, 'button'),
  Content: AccordionContent,
};

export namespace Tabs {
  export type TabsProps = React.ComponentProps<typeof TabsRoot>;
}
