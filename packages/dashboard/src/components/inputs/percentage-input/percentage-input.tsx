import { clx, Input, Text } from '@cms/ui';
import { type ComponentProps, type ElementRef, type ForwardRefExoticComponent, forwardRef, type RefAttributes } from 'react';
import Primitive from 'react-currency-input-field';
import { getNumberOfDecimalPlaces } from '../../../lib/number-helper';

const MIN_DECIMAL_SCALE = 2;

function resolveDecimalScale(value: string | readonly string[] | number | undefined | null): number | undefined {
  if (value == null || Array.isArray(value)) {
    return MIN_DECIMAL_SCALE;
  }
  return Math.max(getNumberOfDecimalPlaces(Number.parseFloat(value.toString())), MIN_DECIMAL_SCALE);
}

export type DeprecatedPercentageInputProps = Omit<ComponentProps<typeof Input>, 'type'>;
export const DeprecatedPercentageInput: ForwardRefExoticComponent<DeprecatedPercentageInputProps & RefAttributes<HTMLInputElement>> = forwardRef<
  ElementRef<typeof Input>,
  DeprecatedPercentageInputProps
>(({ min = 0, max = 100, step = 0.0001, ...props }, ref) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 z-10 flex w-8 items-center justify-center border-r">
      <Text className="text-ui-fg-muted" size="small" leading="compact" weight="plus">
        %
      </Text>
    </div>
    <Input ref={ref} type="number" min={min} max={max} step={step} {...props} className="pl-10" />
  </div>
));
DeprecatedPercentageInput.displayName = 'PercentageInput';

export const PercentageInput = forwardRef<ElementRef<'input'>, ComponentProps<typeof Primitive>>(
  ({ min = 0, max = 100, decimalScale, decimalsLimit, value, className, ...props }, ref) => {
    const resolvedDecimalScale = decimalScale ?? resolveDecimalScale(value);
    const resolvedDecimalsLimit = decimalsLimit ?? resolvedDecimalScale;

    return (
      <div className="relative">
        <Primitive
          ref={ref as any} // dependency is typed incorrectly
          min={min}
          max={max}
          autoComplete="off"
          decimalScale={resolvedDecimalScale}
          decimalsLimit={resolvedDecimalsLimit}
          value={value}
          {...props}
          className={clx(
            'caret-ui-fg-base bg-ui-bg-field shadow-buttons-neutral transition-fg txt-compact-small flex w-full select-none appearance-none items-center justify-between rounded-md px-2 py-1.5 pl-10 text-left outline-none',
            'placeholder:text-ui-fg-muted text-ui-fg-base',
            'hover:bg-ui-bg-field-hover',
            'focus-visible:shadow-borders-interactive-with-active data-[state=open]:!shadow-borders-interactive-with-active',
            'aria-[invalid=true]:border-ui-border-error aria-[invalid=true]:shadow-borders-error',
            'invalid::border-ui-border-error invalid:shadow-borders-error',
            'disabled:!bg-ui-bg-disabled disabled:!text-ui-fg-disabled',
            className,
          )}
        />
        <div className="absolute inset-y-0 left-0 z-10 flex w-8 items-center justify-center border-r">
          <Text className="text-ui-fg-muted" size="small" leading="compact" weight="plus">
            %
          </Text>
        </div>
      </div>
    );
  },
);
PercentageInput.displayName = 'PercentageInput';
