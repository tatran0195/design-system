'use client';

import { CheckCircleSolid, CircleDottedLine, CircleHalfSolid } from '@cms/icons';
import * as React from 'react';
import { Tabs as TabsPrimitive } from '@/primitives/disclosure';
import type { ProgressStatus } from '@/types';
import { clx } from '@/utils/clx';

/**
 * This component is based on the [Base UI Tabs](https://base-ui.com/react/components/tabs) primitves.
 *
 */
const ProgressTabsRoot = (props: TabsPrimitive.TabsProps) => <TabsPrimitive.Root {...props} />;
ProgressTabsRoot.displayName = 'ProgressTabs';

interface IndicatorProps extends Omit<React.ComponentPropsWithoutRef<'span'>, 'children'> {
  /**
   * The current status.
   */
  status?: ProgressStatus;
}

const ProgressIndicator = ({ status, className, ...props }: IndicatorProps) => {
  const Icon = React.useMemo(() => {
    switch (status) {
      case 'not-started':
        return CircleDottedLine;
      case 'in-progress':
        return CircleHalfSolid;
      case 'completed':
        return CheckCircleSolid;
      default:
        return CircleDottedLine;
    }
  }, [status]);

  return (
    <span className={clx('text-ui-fg-muted group-data-[state=active]/trigger:text-ui-fg-interactive', className)} {...props}>
      <Icon />
    </span>
  );
};
ProgressIndicator.displayName = 'ProgressTabs.ProgressIndicator';

interface ProgressTabsTriggerProps extends Omit<React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>, 'asChild'> {
  status?: ProgressStatus;
}

const ProgressTabsTrigger = React.forwardRef<React.ComponentRef<typeof TabsPrimitive.Trigger>, ProgressTabsTriggerProps>(
  ({ className, children, status = 'not-started', ...props }: ProgressTabsTriggerProps, ref) => (
    <TabsPrimitive.Trigger
      ref={ref}
      className={clx(
        'txt-compact-small-plus transition-fg text-ui-fg-muted bg-ui-bg-subtle border-r-ui-border-base inline-flex h-[52px] w-full max-w-[200px] flex-1 items-center gap-x-2 border-r px-4 text-left outline-none',
        'group/trigger overflow-hidden text-ellipsis whitespace-nowrap',
        'disabled:bg-ui-bg-disabled disabled:text-ui-fg-muted',
        'hover:bg-ui-bg-subtle-hover',
        'focus-visible:bg-ui-bg-base focus:z-[1]',
        'data-[state=active]:text-ui-fg-base data-[state=active]:bg-ui-bg-base',
        className,
      )}
      {...props}
    >
      <ProgressIndicator status={status} />
      {children}
    </TabsPrimitive.Trigger>
  ),
);
ProgressTabsTrigger.displayName = 'ProgressTabs.Trigger';

const ProgressTabsList = React.forwardRef<React.ComponentRef<typeof TabsPrimitive.List>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>>(
  ({ className, ...props }, ref) => <TabsPrimitive.List ref={ref} className={clx('flex items-center', className)} {...props} />,
);
ProgressTabsList.displayName = 'ProgressTabs.List';

const ProgressTabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => <TabsPrimitive.Content ref={ref} className={clx('outline-none', className)} {...props} />);
ProgressTabsContent.displayName = 'ProgressTabs.Content';

const ProgressTabs = Object.assign(ProgressTabsRoot, {
  Trigger: ProgressTabsTrigger,
  List: ProgressTabsList,
  Content: ProgressTabsContent,
});

export { ProgressTabs };
