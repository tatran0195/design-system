import { DataTable } from '@cms/ui';
import { useTranslation } from '../../../i18n';

export const LocalizedTablePagination = () => {
  const { t } = useTranslation();

  return (
    <DataTable.Pagination
      translations={{
        of: t('general.of'),
        results: t('general.results'),
        pages: t('general.pages'),
        prev: t('general.prev'),
        next: t('general.next'),
      }}
    />
  );
};
