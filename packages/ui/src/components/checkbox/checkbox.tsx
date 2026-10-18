'use client';

import { CheckMini, MinusMini } from '@cms/icons';
import * as React from 'react';
import { Checkbox as CheckboxPrimitive } from '@/primitives/controls';
import { clx } from '@/utils/clx';
import type { CheckboxCheckedState } from './types';

/**
 * This component is based on the [Base UI Checkbox](https://base-ui.com/react/components/checkbox) primitive.
 */
const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    checked?: CheckboxCheckedState | undefined;
  }
>(({ className, checked, ...props }, ref) => (
  <CheckboxPrimitive.Root
    {...props}
    ref={ref}
    checked={checked}
    className={clx('group inline-flex h-5 w-5 items-center justify-center outline-none ', className)}
  >
    <div
      className={clx(
        'text-ui-fg-on-inverted bg-ui-bg-base shadow-borders-base [&_path]:shadow-details-contrast-on-bg-interactive transition-fg h-[15px] w-[15px] rounded-[3px]',
        'group-disabled:cursor-not-allowed group-disabled:opacity-50',
        'group-focus-visible:!shadow-borders-interactive-with-focus',
        'group-hover:group-enabled:group-data-[state=unchecked]:bg-ui-bg-base-hover',
        'group-data-[state=checked]:bg-ui-bg-interactive group-data-[state=checked]:shadow-borders-interactive-with-shadow',
        'group-data-[state=indeterminate]:bg-ui-bg-interactive group-data-[state=indeterminate]:shadow-borders-interactive-with-shadow',
      )}
    >
      <CheckboxPrimitive.Indicator>
        <CheckMini className="group-data-[state=indeterminate]:hidden" />
        <MinusMini className="hidden group-data-[state=indeterminate]:block" />
      </CheckboxPrimitive.Indicator>
    </div>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = 'Checkbox';

export { Checkbox };
