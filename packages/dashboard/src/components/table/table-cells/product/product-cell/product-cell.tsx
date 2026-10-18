import { useTranslation } from '../../../../../i18n';
import type { ProductSummary } from '../../../../../types/records';
import { Thumbnail } from '../../../../common/thumbnail';
import { TruncatedText } from '../../../../common/truncated-text';

type ProductCellProps = {
  product: Pick<ProductSummary, 'thumbnail' | 'title'>;
};

export const ProductCell = ({ product }: ProductCellProps) => (
  <div className="flex h-full w-full max-w-[250px] items-center gap-x-3 overflow-hidden">
    <div className="w-fit flex-shrink-0">
      <Thumbnail src={product.thumbnail} />
    </div>
    <TruncatedText text={product.title} />
  </div>
);

export const ProductHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="flex h-full w-full items-center">
      <span>{t('fields.product')}</span>
    </div>
  );
};
