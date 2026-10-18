import { useTranslation } from '../../../../../i18n';
import { getPromotionStatus } from '../../../../../lib/promotions';
import type { PromotionSummary } from '../../../../../types/records';
import { StatusCell as StatusCell_ } from '../../common/status-cell';

type PromotionCellProps = {
  promotion: PromotionSummary;
};

export const StatusCell = ({ promotion }: PromotionCellProps) => {
  const { t } = useTranslation();
  const [color, text] = getPromotionStatus(promotion, t);

  return <StatusCell_ color={color}>{text}</StatusCell_>;
};
