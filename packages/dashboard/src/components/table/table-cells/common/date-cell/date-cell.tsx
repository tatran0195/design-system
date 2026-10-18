import { Tooltip } from '@cms/ui';
import { useDate } from '../../../../../hooks/use-date';
import { useTranslation } from '../../../../../i18n';
import { PlaceholderCell } from '../placeholder-cell';

type DateCellProps = {
  date?: Date | string | null;
};

export const DateCell = ({ date }: DateCellProps) => {
  const { getFullDate } = useDate();

  if (!date) {
    return <PlaceholderCell />;
  }

  return (
    <div className="flex h-full w-full items-center overflow-hidden">
      <Tooltip
        content={
          <span className="text-pretty">{`${getFullDate({
            date,
            includeTime: true,
          })}`}</span>
        }
      >
        <span className="truncate">{getFullDate({ date, includeTime: false })}</span>
      </Tooltip>
    </div>
  );
};

export const DateHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="flex h-full w-full items-center">
      <span className="truncate">{t('fields.date')}</span>
    </div>
  );
};
