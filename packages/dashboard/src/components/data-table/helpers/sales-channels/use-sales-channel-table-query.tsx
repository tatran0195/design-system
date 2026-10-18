import { parseJsonQuery, parseNonNegativeInteger, useQueryParams } from '../../../../hooks/use-query-params';
import type { ChannelListQuery } from '../../../../types/records';

type UseSalesChannelTableQueryProps = {
  prefix?: string;
  pageSize?: number;
};

export const useSalesChannelTableQuery = ({ prefix, pageSize = 20 }: UseSalesChannelTableQueryProps) => {
  const queryObject = useQueryParams(['offset', 'q', 'order', 'created_at', 'updated_at', 'is_disabled'], prefix);

  const { offset, created_at, updated_at, is_disabled, ...rest } = queryObject;

  const searchParams: ChannelListQuery = {
    limit: pageSize,
    offset: parseNonNegativeInteger(offset),
    created_at: parseJsonQuery(created_at),
    updated_at: parseJsonQuery(updated_at),
    is_disabled: parseJsonQuery<boolean>(is_disabled, (value): value is boolean => typeof value === 'boolean'),
    ...rest,
  };

  return searchParams;
};
