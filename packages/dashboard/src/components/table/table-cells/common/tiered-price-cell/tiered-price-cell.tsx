import { useCallback, useEffect, useState } from 'react';
import CurrencyInput, { type CurrencyInputProps, formatValue } from 'react-currency-input-field';
import { type Control, Controller, type ControllerRenderProps, useWatch } from 'react-hook-form';
import { DataGridCellContainer } from '../../../../../components/data-grid/components/data-grid-cell-container';
import { useDataGridCell, useDataGridCellError } from '../../../../../components/data-grid/hooks';
import type { DataGridCellProps, InputProps } from '../../../../../components/data-grid/types';
import { useCombinedRefs } from '../../../../../hooks/use-combined-refs';
import { type CurrencyInfo, getCurrencyInfo } from '../../../../../lib/data/currencies';
import { TieredPriceControls } from './tiered-price-controls';

export interface TieredPriceCellProps<TData extends object, TValue = any> extends DataGridCellProps<TData, TValue> {
  code: string;
  onOpenModal: (field: string, currency: CurrencyInfo) => void;
  getTieredFieldName: (field: string) => string;
}

export const TieredPriceCell = <TData extends object, TValue = any>({
  context,
  code,
  onOpenModal,
  getTieredFieldName,
}: TieredPriceCellProps<TData, TValue>) => {
  const [symbolWidth, setSymbolWidth] = useState(0);

  const measuredRef = useCallback((node: HTMLSpanElement) => {
    if (node) {
      const width = node.offsetWidth;
      setSymbolWidth(width);
    }
  }, []);

  const { field, control, renderProps } = useDataGridCell({
    context,
  });
  const errorProps = useDataGridCellError({ context });

  const { container, input } = renderProps;
  const { isAnchor } = container;
  const currency = getCurrencyInfo(code);

  return (
    <Controller
      control={control}
      name={field}
      render={({ field: props }) => (
        <DataGridCellContainer
          {...container}
          {...errorProps}
          outerComponent={
            <OuterComponent
              isAnchor={isAnchor}
              disabled={input.disabled}
              field={field}
              control={control}
              symbolWidth={symbolWidth}
              currency={currency}
              onOpenModal={onOpenModal}
              getTieredFieldName={getTieredFieldName}
            />
          }
        >
          <Inner field={props} inputProps={input} currencyInfo={currency} onMeasureSymbol={measuredRef} />
        </DataGridCellContainer>
      )}
    />
  );
};

const OuterComponent = ({
  isAnchor,
  disabled,
  field,
  control,
  symbolWidth,
  currency,
  onOpenModal,
  getTieredFieldName,
}: {
  isAnchor: boolean;
  disabled?: boolean;
  field: string;
  control: Control<any>;
  symbolWidth: number;
  currency: CurrencyInfo;
  onOpenModal: (field: string, currency: CurrencyInfo) => void;
  getTieredFieldName: (field: string) => string;
}) => {
  const tieredFieldName = getTieredFieldName(field);
  const tiers = useWatch({ control, name: tieredFieldName });

  return (
    <TieredPriceControls
      disabled={disabled}
      isTiered={Array.isArray(tiers) && tiers.length > 0}
      isAnchor={isAnchor}
      symbolWidth={symbolWidth}
      onOpenModal={() => onOpenModal(field, currency)}
    />
  );
};

const Inner = ({
  field,
  onMeasureSymbol,
  inputProps,
  currencyInfo,
}: {
  field: ControllerRenderProps<any, string>;
  onMeasureSymbol: (node: HTMLSpanElement) => void;
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

    if (!Number.isNaN(Number(value))) {
      update = formatter(update);
    }

    setLocalValue(update);
  }, [value, formatter]);

  const combinedRef = useCombinedRefs(inputRef, ref);

  return (
    <div className="relative flex size-full items-center">
      <span className="txt-compact-small text-ui-fg-muted pointer-events-none absolute start-0 w-fit min-w-4" aria-hidden ref={onMeasureSymbol}>
        {currencyInfo.symbol_native}
      </span>
      <CurrencyInput
        {...rest}
        {...attributes}
        ref={combinedRef}
        className="txt-compact-small w-full flex-1 cursor-default appearance-none bg-transparent pl-[60px] text-right outline-none"
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
