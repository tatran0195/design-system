import { createDataTableFilterHelper, type DataTableFilter } from '@cms/ui';
import { useMemo } from 'react';
import { useTranslation } from '../../../../i18n';
import type { ChannelSummary } from '../../../../types/records';
import { useDataTableDateFilters } from '../general/use-data-table-date-filters';

const filterHelper = createDataTableFilterHelper<ChannelSummary>();

export const useSalesChannelTableFilters = (): DataTableFilter[] => {
  const { t } = useTranslation();
  const dateFilters = useDataTableDateFilters();

  return useMemo(
    () => [
      filterHelper.accessor('is_disabled', {
        label: t('fields.status'),
        type: 'radio',
        options: [
          {
            label: t('general.enabled'),
            value: 'false',
          },
          {
            label: t('general.disabled'),
            value: 'true',
          },
        ],
      }),
      ...dateFilters,
    ],
    [dateFilters, t],
  );
};
