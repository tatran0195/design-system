import { useTranslation } from '../../../../../i18n';
import { formatProvider } from '../../../../../lib/format-provider';
import type { ProviderSummary } from '../../../../../types/records';
import { ListSummary } from '../../../../common/list-summary';
import { PlaceholderCell } from '../../common/placeholder-cell';

type PaymentProvidersCellProps = {
  paymentProviders?: ProviderSummary[] | null;
};

export const PaymentProvidersCell = ({ paymentProviders }: PaymentProvidersCellProps) => {
  if (!paymentProviders || paymentProviders.length === 0) {
    return <PlaceholderCell />;
  }

  const displayValues = paymentProviders.map((p) => formatProvider(p.id));

  return (
    <div className="flex size-full items-center overflow-hidden">
      <ListSummary list={displayValues} />
    </div>
  );
};

export const PaymentProvidersHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="flex size-full items-center overflow-hidden">
      <span className="truncate">{t('fields.paymentProviders')}</span>
    </div>
  );
};
