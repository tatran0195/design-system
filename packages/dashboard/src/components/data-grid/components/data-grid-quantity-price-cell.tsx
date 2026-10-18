import type { CurrencyInfo } from '../../../lib/data/currencies';
import { TieredPriceCell } from '../../table/table-cells/common/tiered-price-cell/tiered-price-cell';
import type { DataGridCellProps } from '../types';
export interface DataGridQuantityPriceCellProps<TData extends object, TValue = unknown> extends DataGridCellProps<TData, TValue> {
  code: string;
  getTieredFieldName: (field: string) => string;
  onOpenQuantityPrices: (details: { field: string; currency: CurrencyInfo }) => void;
}
export function DataGridQuantityPriceCell<TData extends object, TValue = unknown>({
  onOpenQuantityPrices,
  ...props
}: DataGridQuantityPriceCellProps<TData, TValue>) {
  return <TieredPriceCell {...props} onOpenModal={(field, currency) => onOpenQuantityPrices({ field, currency })} />;
}
