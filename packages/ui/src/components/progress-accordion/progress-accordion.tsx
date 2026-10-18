'use client';

import { CheckCircleSolid, CircleDottedLine, CircleHalfSolid, Plus } from '@cms/icons';
import * as React from 'react';
import { Accordion as AccordionPrimitive } from '@/primitives/disclosure';
import type { ProgressStatus } from '@/types';
import { clx } from '@/utils/clx';
import { IconButton } from '../icon-button';

/**
 * This component is based on the [Base UI Accordion](https://base-ui.com/react/components/accordion) primitves.
 */
const Root = (props: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>) => <AccordionPrimitive.Root {...props} />;
Root.displayName = 'ProgressAccordion';

const Item = React.forwardRef<React.ComponentRef<typeof AccordionPrimitive.Item>, React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>>(
  ({ className, ...props }, ref) => (
    <AccordionPrimitive.Item ref={ref} className={clx('border-ui-border-base border-b last-of-type:border-b-0', className)} {...props} />
  ),
);
Item.displayName = 'ProgressAccordion.Item';

interface HeaderProps extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Header> {
  status?: ProgressStatus;
}

interface StatusIndicatorProps extends React.ComponentPropsWithoutRef<'span'> {
  status: ProgressStatus;
}

const ProgressIndicator = ({
  /**
   * The current status.
   */
  status,
  ...props
}: StatusIndicatorProps) => {
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
    <span className="text-ui-fg-muted group-data-[state=open]:text-ui-fg-interactive flex h-12 w-12 items-center justify-center" {...props}>
      <Icon />
    </span>
  );
};
ProgressIndicator.displayName = 'ProgressAccordion.ProgressIndicator';

const Header = React.forwardRef<React.ComponentRef<typeof AccordionPrimitive.Header>, HeaderProps>(
  (
    {
      className,
      /**
       * The current status.
       */
      status = 'not-started',
      children,
      ...props
    }: HeaderProps,
    ref,
  ) => {
    const labelId = React.useId();
    return (
      <AccordionPrimitive.Header
        ref={ref}
        className={clx('h3-core text-ui-fg-base group flex w-full flex-1 items-center gap-4 px-6', className)}
        {...props}
      >
        <ProgressIndicator status={status} />
        <span id={labelId} className="contents">
          {children}
        </span>
        <AccordionPrimitive.Trigger asChild className="ml-auto" aria-labelledby={labelId}>
          <IconButton variant="transparent">
            <Plus className="transform transition-transform group-data-[state=open]:rotate-45" />
          </IconButton>
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
    );
  },
);
Header.displayName = 'ProgressAccordion.Header';

const Content = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={clx('overflow-hidden', 'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down pl-[88px] pr-6', className)}
    {...props}
  />
));
Content.displayName = 'ProgressAccordion.Content';

const ProgressAccordion = Object.assign(Root, {
  Item,
  Header,
  Content,
});

export { ProgressAccordion };
