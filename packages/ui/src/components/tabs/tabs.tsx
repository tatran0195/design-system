'use client';

import * as React from 'react';
import { Tabs as TabsPrimitive } from '@/primitives/disclosure';
import { clx } from '@/utils/clx';

/**
 * This component is based on the [Base UI Tabs](https://base-ui.com/react/components/tabs) primitves
 */
const TabsRoot = (props: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>) => <TabsPrimitive.Root {...props} />;
TabsRoot.displayName = 'Tabs';

const TabsTrigger = React.forwardRef<React.ComponentRef<typeof TabsPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>>(
  ({ className, children, ...props }, ref) => (
    <TabsPrimitive.Trigger
      ref={ref}
      className={clx(
        'txt-compact-small-plus transition-fg text-ui-fg-subtle inline-flex items-center justify-center rounded-full border border-transparent bg-transparent px-2.5 py-1 outline-none',
        'hover:text-ui-fg-base',
        'focus-visible:border-ui-border-interactive focus-visible:!shadow-borders-focus focus-visible:bg-ui-bg-base',
        'data-[state=active]:text-ui-fg-base data-[state=active]:bg-ui-bg-base data-[state=active]:shadow-elevation-card-rest',
        className,
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.Trigger>
  ),
);
TabsTrigger.displayName = 'Tabs.Trigger';

const TabsList = React.forwardRef<React.ComponentRef<typeof TabsPrimitive.List>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>>(
  ({ className, ...props }, ref) => <TabsPrimitive.List ref={ref} className={clx('flex items-center gap-2', className)} {...props} />,
);
TabsList.displayName = 'Tabs.List';

const TabsContent = React.forwardRef<React.ComponentRef<typeof TabsPrimitive.Content>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>>(
  ({ className, ...props }, ref) => <TabsPrimitive.Content ref={ref} className={clx('outline-none', className)} {...props} />,
);
TabsContent.displayName = 'Tabs.Content';

const Tabs = Object.assign(TabsRoot, {
  Trigger: TabsTrigger,
  List: TabsList,
  Content: TabsContent,
});

export { Tabs };
