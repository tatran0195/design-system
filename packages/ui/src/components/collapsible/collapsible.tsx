'use client';

import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible';

/**
 * Migrated from the nibleaf design system (`@base-ui/react/collapsible`).
 * Unstyled primitives — styling is applied by the consumer.
 */

const Collapsible = BaseCollapsible.Root;
const CollapsibleTrigger = BaseCollapsible.Trigger;
const CollapsibleContent = BaseCollapsible.Panel;

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
