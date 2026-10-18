'use client';

import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion';
import { ChevronDown } from '@cms/icons';
import { clx } from '@/utils/clx';

/**
 * Migrated from the nibleaf design system (`@base-ui/react/accordion`),
 * restyled with cms `ui-*` tokens. Height animation uses the Base UI-native
 * `--accordion-panel-height` variable instead of `tw-animate-css` keyframes.
 */

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return <AccordionPrimitive.Root data-slot="accordion" className={clx('flex w-full flex-col', className)} {...props} />;
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item data-slot="accordion-item" className={clx('not-last:border-b not-last:border-ui-border-base', className)} {...props} />
  );
}

function AccordionTrigger({ className, children, ...props }: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={clx(
          'group/accordion-trigger txt-compact-medium-plus relative flex flex-1 items-start justify-between rounded-md border border-transparent py-4 text-start text-ui-fg-base transition-all outline-none hover:underline focus-visible:shadow-borders-interactive-with-focus aria-disabled:pointer-events-none aria-disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ms-auto **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:text-ui-fg-muted',
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown
          data-slot="accordion-trigger-icon"
          className="pointer-events-none shrink-0 transition-transform duration-200 group-aria-expanded/accordion-trigger:rotate-180"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({ className, children, ...props }: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="txt-compact-medium h-(--accordion-panel-height) overflow-hidden text-ui-fg-subtle transition-[height] duration-200 data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none"
      {...props}
    >
      <div className={clx('pt-0 pb-4 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-ui-fg-base [&_p:not(:last-child)]:mb-4', className)}>
        {children}
      </div>
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
