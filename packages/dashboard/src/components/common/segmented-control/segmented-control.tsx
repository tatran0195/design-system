import { SegmentedControlItem, SegmentedControl as UiSegmentedControl } from '@cms/ui';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
export type SegmentedControlOption = { value: string; label: ReactNode; disabled?: boolean };
export interface SegmentedControlProps extends Omit<ComponentPropsWithoutRef<typeof UiSegmentedControl>, 'children'> {
  value: string;
  onValueChange: (value: string) => void;
  options: SegmentedControlOption[];
}
/** Options-based adapter over the primary CMS segmented-control primitives. */
export function SegmentedControl({ value, onValueChange, options, ...props }: SegmentedControlProps) {
  return (
    <UiSegmentedControl {...props}>
      {options.map((option) => (
        <SegmentedControlItem
          key={option.value}
          active={option.value === value}
          disabled={option.disabled}
          onClick={() => onValueChange(option.value)}
        >
          {option.label}
        </SegmentedControlItem>
      ))}
    </UiSegmentedControl>
  );
}
