import { useTranslation } from '../../../../../i18n';
import type { ProductVariantSummary } from '../../../../../types/records';
import { PlaceholderCell } from '../../common/placeholder-cell';

type VariantCellProps = {
  variants?: ProductVariantSummary[] | null;
};

export const VariantCell = ({ variants }: VariantCellProps) => {
  const { t } = useTranslation();

  if (!variants?.length) {
    return <PlaceholderCell />;
  }

  return (
    <div className="flex h-full w-full items-center overflow-hidden">
      <span className="truncate">{t('products.variantCount', { count: variants.length })}</span>
    </div>
  );
};

export const VariantHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="flex h-full w-full items-center">
      <span>{t('fields.variants')}</span>
    </div>
  );
};
