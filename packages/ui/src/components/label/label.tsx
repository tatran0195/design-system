'use client';

import { cva, type VariantProps } from 'cva';
import * as React from 'react';
import { clx } from '@/utils/clx';

const labelVariants = cva({
  base: 'font-sans',
  variants: {
    size: {
      xsmall: 'txt-compact-xsmall',
      small: 'txt-compact-small',
      base: 'txt-compact-medium',
      large: 'txt-compact-large',
    },
    weight: {
      regular: 'font-normal',
      plus: 'font-medium',
    },
  },
  defaultVariants: {
    size: 'base',
    weight: 'regular',
  },
});

interface LabelProps extends React.ComponentPropsWithoutRef<'label'>, VariantProps<typeof labelVariants> {}

/**
 * A native HTML label, preserving htmlFor, refs and browser form semantics.
 */
const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  (
    {
      className,
      /**
       * The label's size.
       */
      size = 'base',
      /**
       * The label's font weight.
       */
      weight = 'regular',
      ...props
    }: LabelProps,
    ref,
  ) => <label ref={ref} className={clx(labelVariants({ size, weight }), className)} {...props} />,
);
Label.displayName = 'Label';

export { Label };
