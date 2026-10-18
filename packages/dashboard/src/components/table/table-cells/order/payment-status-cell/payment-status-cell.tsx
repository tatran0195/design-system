import { useTranslation } from '../../../../../i18n';
import { getOrderPaymentStatus } from '../../../../../lib/order-helpers';
import type { OrderSummary } from '../../../../../types/records';
import { StatusCell } from '../../common/status-cell';

type PaymentStatusCellProps = {
  status: OrderSummary['payment_status'];
};

export const PaymentStatusCell = ({ status }: PaymentStatusCellProps) => {
  const { t } = useTranslation();

  const { label, color } = getOrderPaymentStatus(t, status ?? '');

  return <StatusCell color={color}>{label}</StatusCell>;
};

export const PaymentStatusHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="flex h-full w-full items-center">
      <span className="truncate">{t('fields.payment')}</span>
    </div>
  );
};
