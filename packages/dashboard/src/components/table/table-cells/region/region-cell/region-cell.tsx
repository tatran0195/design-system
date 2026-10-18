import { useTranslation } from '../../../../../i18n';

type RegionCellProps = {
  name: string;
};

export const RegionCell = ({ name }: RegionCellProps) => (
  <div className="flex h-full w-full items-center overflow-hidden">
    <span className="truncate">{name}</span>
  </div>
);

export const RegionHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="flex h-full w-full items-center">
      <span className="truncate">{t('fields.name')}</span>
    </div>
  );
};
