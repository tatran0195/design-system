import { Switch as CmsSwitch } from '@cms/ui';
import { type ComponentProps, forwardRef } from 'react';
export const Switch = forwardRef<HTMLButtonElement, Omit<ComponentProps<typeof CmsSwitch>, 'size'> & { size?: 'sm' | 'small' | 'base' }>(
  function Switch({ size, ...props }, ref) {
    return <CmsSwitch {...props} ref={ref} size={size === 'sm' ? 'small' : size} />;
  },
);
