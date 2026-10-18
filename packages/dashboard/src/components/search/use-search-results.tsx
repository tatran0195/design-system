'use client';
import { matchSorter } from 'match-sorter';
import { useEffect, useMemo, useState } from 'react';
import { useDebouncedValue } from '../../hooks/use-debounced-value';
import type { SearchResultGroup, SearchResultItem, SearchSource } from './types';

const NO_SOURCES: SearchSource[] = [];
const NO_ITEMS: SearchResultItem[] = [];
export interface UseSearchResultsOptions {
  q?: string;
  sources?: SearchSource[];
  items?: SearchResultItem[];
  limit?: number;
  area?: string;
  enabled?: boolean;
  debounceMs?: number;
}
export function useSearchResults({
  q = '',
  sources = NO_SOURCES,
  items = NO_ITEMS,
  limit = 10,
  area = 'all',
  enabled = true,
  debounceMs = 200,
}: UseSearchResultsOptions) {
  const query = useDebouncedValue(q, debounceMs);
  const [dynamicResults, setDynamic] = useState<SearchResultGroup[]>([]);
  const [isFetching, setFetching] = useState(false);
  const [errors, setErrors] = useState<unknown[]>([]);
  const staticResults = useMemo(
    () => (area === 'all' || area === 'commands' ? matchSorter(items, q, { keys: ['title', 'subtitle', 'keywords'] }).slice(0, limit) : []),
    [items, q, limit, area],
  );
  useEffect(() => {
    const controller = new AbortController();
    if (!enabled || !sources.length || area === 'commands') {
      setFetching(false);
      setDynamic([]);
      setErrors([]);
      return () => controller.abort();
    }
    const active = sources.filter((source) => area === 'all' || source.id === area);
    setFetching(active.length > 0);
    setErrors([]);
    setDynamic([]);
    Promise.allSettled(
      active.map(async (source) => ({ id: source.id, label: source.label, ...(await source.search(query, { signal: controller.signal, limit })) })),
    ).then((results) => {
      if (controller.signal.aborted) return;
      setDynamic(results.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : [])));
      setErrors(results.flatMap((result) => (result.status === 'rejected' ? [result.reason] : [])));
      setFetching(false);
    });
    return () => controller.abort();
  }, [query, sources, limit, area, enabled]);
  return { staticResults, dynamicResults, isFetching, errors, query };
}
