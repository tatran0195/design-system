import type { SearchSource } from './types';
export const DEFAULT_SEARCH_LIMIT = 10;
export const SEARCH_LIMIT_INCREMENT = 20;
export const getSearchAreas = (sources: readonly SearchSource[] = []) => ['all', ...sources.map((source) => source.id), 'commands'];
