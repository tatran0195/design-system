import type { ReactNode } from 'react';
export type SearchArea = string;
export interface SearchResultItem {
  id: string;
  title: string;
  subtitle?: string;
  href?: string;
  icon?: ReactNode;
  thumbnail?: string;
  keywords?: string[];
  disabled?: boolean;
  onSelect?: () => void | Promise<void>;
}
export interface SearchResultGroup {
  id: string;
  label: string;
  items: SearchResultItem[];
  count?: number;
  hasMore?: boolean;
}
export interface SearchSource {
  id: string;
  label: string;
  search: (
    query: string,
    options: { signal: AbortSignal; limit: number },
  ) => Promise<{ items: SearchResultItem[]; count?: number; hasMore?: boolean }>;
}
export type DynamicSearchResultItem = SearchResultItem;
export type DynamicSearchResult = SearchResultGroup;
