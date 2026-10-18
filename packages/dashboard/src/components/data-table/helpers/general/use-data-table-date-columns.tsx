import { createDataTableColumnHelper, type DataTableColumnDef, Tooltip } from '@cms/ui';
import { useMemo } from 'react';
import { useDate } from '../../../../hooks/use-date';
import { useTranslation } from '../../../../i18n';

type EntityWithDates = {
  created_at?: string | null;
  updated_at?: string | null;
};

const columnHelper = createDataTableColumnHelper<EntityWithDates>();

export const useDataTableDateColumns = <TData extends EntityWithDates>() => {
  const { t } = useTranslation();
  const { getFullDate } = useDate();

  return useMemo(
    () =>
      [
        columnHelper.accessor('created_at', {
          header: t('fields.createdAt'),
          cell: ({ row }) => (
            <Tooltip
              content={getFullDate({
                date: row.original.created_at ?? '',
                includeTime: true,
              })}
            >
              <span>{getFullDate({ date: row.original.created_at ?? '' })}</span>
            </Tooltip>
          ),
          enableSorting: true,
          sortAscLabel: t('filters.sorting.dateAsc'),
          sortDescLabel: t('filters.sorting.dateDesc'),
        }),
        columnHelper.accessor('updated_at', {
          header: t('fields.updatedAt'),
          cell: ({ row }) => (
            <Tooltip
              content={getFullDate({
                date: row.original.updated_at ?? '',
                includeTime: true,
              })}
            >
              <span>{getFullDate({ date: row.original.updated_at ?? '' })}</span>
            </Tooltip>
          ),
          enableSorting: true,
          sortAscLabel: t('filters.sorting.dateAsc'),
          sortDescLabel: t('filters.sorting.dateDesc'),
        }),
      ] as DataTableColumnDef<TData>[],
    [t, getFullDate],
  );
};
