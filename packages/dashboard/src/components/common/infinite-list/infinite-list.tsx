'use client';
import { Button, Text } from '@cms/ui';
import type { QueryKey } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useInfiniteList } from '../../../hooks/use-infinite-list';
import { useIntersectionObserver } from '../../../hooks/use-intersection-observer';
export interface InfiniteListProps<TResponse, TEntity, TParams> {
  queryKey: QueryKey;
  queryFn: (params: TParams, signal?: AbortSignal) => Promise<TResponse>;
  query?: TParams;
  enabled?: boolean;
  renderItem: (item: TEntity) => ReactNode;
  getKey: (item: TEntity) => string;
  selectItems: (page: TResponse) => TEntity[];
  renderEmpty?: () => ReactNode;
  pageSize?: number;
  className?: string;
}
/** QueryClientProvider is supplied by the host. Includes a keyboard-accessible pagination fallback. */
export function InfiniteList<
  TResponse extends { count: number; offset: number; limit: number },
  TEntity,
  TParams extends { offset?: number; limit?: number },
>({
  queryKey,
  queryFn,
  query,
  enabled = true,
  renderItem,
  getKey,
  selectItems,
  renderEmpty = () => 'No records.',
  pageSize = 20,
  className,
}: InfiniteListProps<TResponse, TEntity, TParams>) {
  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, refetch, isFetching } = useInfiniteList<TResponse, TParams>({
    queryKey,
    queryFn,
    query: { ...query, limit: pageSize } as TParams,
    options: { enabled },
  });
  const sentinel = useIntersectionObserver<HTMLDivElement>({
    enabled: enabled && hasNextPage && !isFetchingNextPage,
    onIntersect: () => {
      void fetchNextPage();
    },
  });
  const items = data?.pages.flatMap(selectItems) ?? [];
  return (
    <div className={className} aria-busy={enabled && isFetching}>
      {error && (
        <Text role="alert" className="text-ui-fg-error">
          Unable to load records.
        </Text>
      )}
      {items.length ? (
        <ul className="list-none p-0">
          {items.map((item) => (
            <li key={getKey(item)}>{renderItem(item)}</li>
          ))}
        </ul>
      ) : (
        <div role="status">{enabled && isPending ? 'Loading…' : error ? null : renderEmpty()}</div>
      )}
      <div ref={sentinel} className="h-px" aria-hidden />
      {error && !hasNextPage && (
        <Button type="button" variant="secondary" onClick={() => void refetch()} isLoading={isFetching}>
          Retry
        </Button>
      )}
      {hasNextPage && (
        <Button type="button" variant="secondary" onClick={() => void fetchNextPage()} isLoading={isFetchingNextPage}>
          Load more
        </Button>
      )}
    </div>
  );
}
