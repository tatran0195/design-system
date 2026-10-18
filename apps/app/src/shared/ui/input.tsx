import { Input as CmsInput, clx } from '@cms/ui';
import { type ComponentProps, forwardRef } from 'react';

type InputProps = Omit<ComponentProps<typeof CmsInput>, 'size'> & {
  size?: ComponentProps<typeof CmsInput>['size'] | number;
  density?: 'default' | 'compact';
};
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ wrapperClassName, density, size, ...props }, ref) {
  return (
    <CmsInput
      {...props}
      ref={ref}
      htmlSize={typeof size === 'number' ? size : undefined}
      size={density === 'compact' ? 'small' : typeof size === 'number' ? 'base' : size}
      wrapperClassName={clx('min-w-0', wrapperClassName)}
    />
  );
});
