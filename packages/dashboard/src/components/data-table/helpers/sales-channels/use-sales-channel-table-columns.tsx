import type { DataTableColumnDef } from '@cms/ui';
import { createDataTableColumnHelper, Tooltip } from '@cms/ui';
import { useMemo } from 'react';
import { useTranslation } from '../../../../i18n';
import type { ChannelSummary } from '../../../../types/records';
import { DataTableStatusCell } from '../../components/data-table-status-cell/data-table-status-cell';
import { useDataTableDateColumns } from '../general/use-data-table-date-columns';

const columnHelper = createDataTableColumnHelper<ChannelSummary>();

export const useSalesChannelTableColumns = (): DataTableColumnDef<ChannelSummary, any>[] => {
  const { t } = useTranslation();
  const dateColumns = useDataTableDateColumns<ChannelSummary>();

  return useMemo(
    () => [
      columnHelper.accessor('name', {
        header: () => t('fields.name'),
        enableSorting: true,
        sortLabel: t('fields.name'),
        sortAscLabel: t('filters.sorting.alphabeticallyAsc'),
        sortDescLabel: t('filters.sorting.alphabeticallyDesc'),
      }),
      columnHelper.accessor('description', {
        header: () => t('fields.description'),
        cell: ({ getValue }) => (
          <Tooltip content={getValue()}>
            <div className="flex h-full w-full items-center overflow-hidden">
              <span className="truncate">{getValue()}</span>
            </div>
          </Tooltip>
        ),
        enableSorting: true,
        sortLabel: t('fields.description'),
        sortAscLabel: t('filters.sorting.alphabeticallyAsc'),
        sortDescLabel: t('filters.sorting.alphabeticallyDesc'),
        maxSize: 250,
        minSize: 100,
      }),
      columnHelper.accessor('is_disabled', {
        header: () => t('fields.status'),
        enableSorting: true,
        sortLabel: t('fields.status'),
        sortAscLabel: t('filters.sorting.alphabeticallyAsc'),
        sortDescLabel: t('filters.sorting.alphabeticallyDesc'),
        cell: ({ getValue }) => {
          const value = getValue();
          return <DataTableStatusCell color={value ? 'grey' : 'green'}>{value ? t('general.disabled') : t('general.enabled')}</DataTableStatusCell>;
        },
      }),
      ...dateColumns,
    ],
    [t, dateColumns],
  );
};
