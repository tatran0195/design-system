import { type InfiniteData, type QueryKey, type UseInfiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query';

/**
 * Generic hook for infinite queries with pagination support.
 *
 * @template TResponse - The response type that must include count, offset, and limit
 * @template TParams - The query parameters type (offset and limit will be handled internally)
 * @template TError - The error type (defaults to Error)
 * @template TQueryKey - The query key type (defaults to QueryKey)
 *
 * @param config - Configuration object
 * @param config.queryKey - Function or array that generates the query key
 * @param config.queryFn - Function that fetches data with offset and limit
 * @param config.query - Query parameters (offset is ignored, limit is optional)
 * @param config.options - Additional options for useInfiniteQuery
 *
 * @example
 * ```ts
 * const { data, fetchNextPage, hasNextPage } = useInfiniteList({
 *   queryKey: (params) => ["products", params],
 *   queryFn: async (params) => loadProducts(params),
 *   query: { status: "published" },
 * })
 * ```
 */
export const useInfiniteList = <
  TResponse extends { count: number; offset: number; limit: number },
  TParams extends { offset?: number; limit?: number } = {
    offset?: number;
    limit?: number;
  },
  TError = Error,
  TQueryKey extends QueryKey = QueryKey,
>({
  queryKey,
  queryFn,
  query,
  options,
}: {
  queryKey: ((params: Omit<TParams, 'limit' | 'offset'>) => TQueryKey) | TQueryKey;
  queryFn: (params: TParams, signal?: AbortSignal) => Promise<TResponse>;
  query?: TParams;
  options?: Omit<
    UseInfiniteQueryOptions<TResponse, TError, InfiniteData<TResponse, number>, TQueryKey, number>,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'
  >;
}) => {
  const { limit = 50, offset: _, ..._query } = query ?? {};
  const pageLimit = Number.isFinite(limit) && limit > 0 ? Math.max(1, Math.floor(limit)) : 50;
  const resolvedQueryKey = typeof queryKey === 'function' ? queryKey(_query as Omit<TParams, 'limit' | 'offset'>) : queryKey;
  const baseKey = resolvedQueryKey[resolvedQueryKey.length - 1] === '__infinite' ? resolvedQueryKey.slice(0, -1) : resolvedQueryKey;
  const infiniteQueryKey = [...baseKey, { limit: pageLimit }, '__infinite'] as unknown as TQueryKey;

  return useInfiniteQuery<TResponse, TError, InfiniteData<TResponse, number>, TQueryKey, number>({
    // Infinite queries must not share the exact same queryKey as non-infinite queries,
    // since the cached data shape differs (InfiniteData<T> vs T).
    queryKey: infiniteQueryKey,
    queryFn: ({ pageParam = 0, signal }) => queryFn({ ..._query, limit: pageLimit, offset: pageParam } as TParams, signal),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (
        !Number.isFinite(lastPage.count) ||
        !Number.isFinite(lastPage.offset) ||
        !Number.isFinite(lastPage.limit) ||
        lastPage.offset < 0 ||
        lastPage.limit <= 0
      )
        return;
      const moreItemsExist = lastPage.count > lastPage.offset + lastPage.limit;
      return moreItemsExist ? lastPage.offset + lastPage.limit : undefined;
    },
    ...options,
  });
};
