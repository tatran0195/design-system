'use client';

import { Autocomplete } from '@base-ui/react/autocomplete';
import { MagnifyingGlass, Spinner } from '@cms/icons';
import { Button, clx, FocusModal as Dialog, Input, Text } from '@cms/ui';
import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';
import { useKeyboardShortcut } from '../../hooks/use-keyboard-shortcut';
import { useNavigate } from '../../routing';
import { Thumbnail } from '../common/thumbnail';
import { DEFAULT_SEARCH_LIMIT, SEARCH_LIMIT_INCREMENT } from './constants';
import type { SearchResultItem, SearchSource } from './types';
import { useSearchResults } from './use-search-results';

const EMPTY_SOURCES: SearchSource[] = [];
const EMPTY_ITEMS: SearchResultItem[] = [];
interface SearchContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sources: SearchSource[];
  items: SearchResultItem[];
}
const SearchContext = createContext<SearchContextValue | null>(null);
export interface SearchProviderProps {
  children: ReactNode;
  sources?: SearchSource[];
  items?: SearchResultItem[];
  shortcut?: boolean;
}
export function SearchProvider({ children, sources = EMPTY_SOURCES, items = EMPTY_ITEMS, shortcut = false }: SearchProviderProps) {
  const [open, onOpenChange] = useState(false);
  useKeyboardShortcut(() => onOpenChange(true), { key: 'k', mod: true, enabled: shortcut });
  const value = useMemo(() => ({ open, onOpenChange, sources, items }), [open, sources, items]);
  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}
export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) throw new Error('useSearch requires a SearchProvider.');
  return context;
}
export interface SearchProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  sources?: SearchSource[];
  items?: SearchResultItem[];
  title?: string;
  placeholder?: string;
  emptyMessage?: string;
  initialLimit?: number;
  debounceMs?: number;
  onSelect?: (item: SearchResultItem) => void | Promise<void>;
  className?: string;
}
export function Search({
  open: controlledOpen,
  onOpenChange,
  sources: suppliedSources,
  items: suppliedItems,
  title = 'Search',
  placeholder = 'Search records, pages, and commands…',
  emptyMessage = 'No results found.',
  initialLimit = DEFAULT_SEARCH_LIMIT,
  debounceMs,
  onSelect,
  className,
}: SearchProps) {
  const context = useContext(SearchContext);
  const [internal, setInternal] = useState(false);
  const open = controlledOpen ?? context?.open ?? internal;
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(initialLimit);
  const [selectionError, setSelectionError] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const sources = suppliedSources ?? context?.sources ?? EMPTY_SOURCES;
  const items = suppliedItems ?? context?.items ?? EMPTY_ITEMS;
  const navigate = useNavigate();
  const { staticResults, dynamicResults, isFetching, errors } = useSearchResults({ q: query, limit, sources, items, enabled: open, debounceMs });
  const groups = [...(staticResults.length ? [{ id: 'commands', label: 'Commands and pages', items: staticResults }] : []), ...dynamicResults];
  const change = (next: boolean) => {
    setInternal(next);
    (onOpenChange ?? context?.onOpenChange)?.(next);
    if (!next) {
      setQuery('');
      setLimit(initialLimit);
      setSelectionError(false);
    }
  };
  const select = async (item: SearchResultItem) => {
    if (selecting || item.disabled) return;
    setSelecting(true);
    setSelectionError(false);
    try {
      await onSelect?.(item);
      await item.onSelect?.();
      if (item.href) navigate(item.href);
      change(false);
    } catch {
      setSelectionError(true);
    } finally {
      setSelecting(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={change}>
      <Dialog.Content
        overlayProps={{ className: 'backdrop-blur-sm' }}
        className={clx(
          'bg-ui-bg-base text-ui-fg-base shadow-elevation-modal fixed inset-x-3 top-[12vh] bottom-auto border-0 z-ui-modal mx-auto max-h-[76vh] max-w-2xl overflow-hidden rounded-xl outline-none',
          className,
        )}
      >
        <Dialog.Title className="sr-only">{title}</Dialog.Title>
        <Dialog.Description className="sr-only">
          Search available records and commands. Use arrow keys to move and Enter to select.
        </Dialog.Description>
        <Autocomplete.Root
          inline
          open
          items={groups}
          mode="none"
          autoHighlight="always"
          keepHighlight
          loopFocus
          value={query}
          itemToStringValue={(item) => item.title}
          onValueChange={(value, details) => {
            // Action selection must not replace the query while a host callback
            // is pending or fails. Only native text edits change the search.
            if (details.reason !== 'input-change' && details.reason !== 'input-clear' && details.reason !== 'clear-press') return;
            setQuery(value);
            setLimit(initialLimit);
          }}
        >
          <div>
            <div className="border-ui-border-base flex items-center gap-3 border-b p-3">
              <MagnifyingGlass className="text-ui-fg-muted shrink-0" />
              <Autocomplete.Input render={<Input wrapperClassName="flex-1" placeholder={placeholder} aria-label={title} />} />
              {isFetching && <Spinner aria-label="Searching" className="animate-spin" />}
              <Dialog.Close asChild>
                <Button variant="transparent" size="small" aria-label="Close search">
                  Esc
                </Button>
              </Dialog.Close>
            </div>
            <Autocomplete.List className="max-h-[55vh] overflow-y-auto p-2" aria-busy={isFetching || selecting}>
              {!isFetching && !groups.some((group) => group.items.length) && (
                <Autocomplete.Empty className="text-ui-fg-subtle p-8 text-center text-sm">{emptyMessage}</Autocomplete.Empty>
              )}
              {groups.map((group) => (
                <Autocomplete.Group key={group.id} items={group.items}>
                  <Autocomplete.GroupLabel className="text-ui-fg-muted px-2 py-2 text-xs">{group.label}</Autocomplete.GroupLabel>
                  {group.items.map((item) => (
                    <Autocomplete.Item
                      key={item.id}
                      value={item}
                      disabled={item.disabled || selecting}
                      onClick={() => void select(item)}
                      className="data-[highlighted]:bg-ui-bg-subtle-hover data-[disabled]:opacity-50 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 outline-none"
                    >
                      {item.thumbnail ? <Thumbnail src={item.thumbnail} size="small" /> : item.icon && <span aria-hidden>{item.icon}</span>}
                      <span className="min-w-0">
                        <Text size="small" weight="plus" className="truncate">
                          {item.title}
                        </Text>
                        {item.subtitle && (
                          <Text size="small" className="text-ui-fg-subtle truncate">
                            {item.subtitle}
                          </Text>
                        )}
                      </span>
                    </Autocomplete.Item>
                  ))}
                </Autocomplete.Group>
              ))}
            </Autocomplete.List>
            {(selectionError || errors.length > 0) && (
              <Text role="alert" size="small" className="text-ui-fg-error px-4 py-2">
                {selectionError ? 'Unable to complete this action. Please try again.' : 'Some search results could not be loaded.'}
              </Text>
            )}
            {dynamicResults.some((group) => group.hasMore) && (
              <div className="border-ui-border-base border-t p-3">
                <Button size="small" variant="secondary" onClick={() => setLimit((value) => value + SEARCH_LIMIT_INCREMENT)} isLoading={isFetching}>
                  Show more results
                </Button>
              </div>
            )}
          </div>
        </Autocomplete.Root>
      </Dialog.Content>
    </Dialog>
  );
}
export const DashboardSearch = Search;
