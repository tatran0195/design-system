import { useCallback, useEffect, useState } from 'react';
import CurrencyInput, { type CurrencyInputProps, formatValue } from 'react-currency-input-field';
import { Controller, type ControllerRenderProps } from 'react-hook-form';
import { useCombinedRefs } from '../../../hooks/use-combined-refs';
import { type CurrencyInfo, getCurrencyInfo } from '../../../lib/data/currencies';
import { useDataGridCell, useDataGridCellError } from '../hooks';
import type { DataGridCellProps, InputProps } from '../types';
import { DataGridCellContainer } from './data-grid-cell-container';

export interface DataGridCurrencyCellProps<TData extends object, TValue = any> extends DataGridCellProps<TData, TValue> {
  code: string;
}

export const DataGridCurrencyCell = <TData extends object, TValue = any>({ context, code }: DataGridCurrencyCellProps<TData, TValue>) => {
  const { field, control, renderProps } = useDataGridCell({
    context,
  });
  const errorProps = useDataGridCellError({ context });

  const { container, input } = renderProps;

  const currency = getCurrencyInfo(code);

  return (
    <Controller
      control={control}
      name={field}
      render={({ field }) => (
        <DataGridCellContainer {...container} {...errorProps}>
          <Inner field={field} inputProps={input} currencyInfo={currency} />
        </DataGridCellContainer>
      )}
    />
  );
};

const Inner = ({
  field,
  inputProps,
  currencyInfo,
}: {
  field: ControllerRenderProps<any, string>;
  inputProps: InputProps;
  currencyInfo: CurrencyInfo;
}) => {
  const { value, onChange: _, onBlur, ref, ...rest } = field;
  const { ref: inputRef, onBlur: onInputBlur, onFocus, onChange, ...attributes } = inputProps;

  const formatter = useCallback(
    (value?: string | number) => {
      const ensuredValue = typeof value === 'number' ? value.toString() : value || '';

      return formatValue({
        value: ensuredValue,
        decimalScale: currencyInfo.decimal_digits,
        disableGroupSeparators: true,
        decimalSeparator: '.',
      });
    },
    [currencyInfo],
  );

  const [localValue, setLocalValue] = useState<string | number>(value || '');

  const handleValueChange: CurrencyInputProps['onValueChange'] = (value, _name, _values) => {
    if (!value) {
      setLocalValue('');
      return;
    }

    setLocalValue(value);
  };

  useEffect(() => {
    let update = value;

    // The component we use is a bit fidly when the value is updated externally
    // so we need to ensure a format that will result in the cell being formatted correctly
    // according to the users locale on the next render.
    if (!Number.isNaN(Number(value))) {
      update = formatter(update);
    }

    setLocalValue(update);
  }, [value, formatter]);

  const combinedRed = useCombinedRefs(inputRef, ref);

  return (
    <div className="relative flex size-full items-center">
      <span className="txt-compact-small text-ui-fg-muted pointer-events-none absolute start-0 w-fit min-w-4" aria-hidden>
        {currencyInfo.symbol_native}
      </span>
      <CurrencyInput
        {...rest}
        {...attributes}
        ref={combinedRed}
        className="txt-compact-small w-full flex-1 cursor-default appearance-none bg-transparent ps-8 text-end outline-none"
        value={localValue || undefined}
        onValueChange={handleValueChange}
        formatValueOnBlur
        onBlur={() => {
          onBlur();
          onInputBlur();

          onChange(localValue, value);
        }}
        onFocus={onFocus}
        decimalScale={currencyInfo.decimal_digits}
        decimalsLimit={currencyInfo.decimal_digits}
        autoComplete="off"
        tabIndex={-1}
      />
    </div>
  );
};
