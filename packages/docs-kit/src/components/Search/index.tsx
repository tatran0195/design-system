'use client';

import clsx from 'clsx';
import type React from 'react';
import { useEffect, useRef } from 'react';
import { InstantSearch, SearchBox } from 'react-instantsearch';
import { SpinnerLoading } from '@/components/Loading/Spinner';
import { useSearchNavigation } from '@/hooks/use-search-navigation';
import type { OptionType } from '@/hooks/use-select';
import { type AlgoliaProps, useSearch } from '@/providers/Search';
import { SearchCallout } from './Callout';
import { SearchEmptyQueryBoundary } from './EmptyQueryBoundary';
import { SearchFilters } from './Filters';
import { SearchFooter } from './Footer';
import { SearchHitsWrapper } from './Hits';
import { SearchSuggestions, type SearchSuggestionType } from './Suggestions';

export type SearchProps = {
  algolia: AlgoliaProps;
  isLoading?: boolean;
  suggestions: SearchSuggestionType[];
  checkInternalPattern?: RegExp;
  filterOptions?: OptionType[];
};

export const Search = ({ algolia, suggestions, isLoading = false, checkInternalPattern }: SearchProps) => {
  const { isOpen, searchClient, modalRef } = useSearch();
  const searchBoxRef = useRef<HTMLFormElement>(null);

  const focusSearchInput = () => searchBoxRef.current?.querySelector('input')?.focus();

  useEffect(() => {
    if (isOpen && searchBoxRef.current) {
      focusSearchInput();
    } else if (!isOpen) {
      const focusedItem = modalRef.current?.querySelector(':focus') as HTMLElement;
      if (focusedItem && focusedItem === searchBoxRef.current?.querySelector('input')) {
        // remove focus
        focusedItem.blur();
      }
    }
  }, [isOpen, modalRef.current?.querySelector, focusSearchInput]);

  useSearchNavigation({
    getInputElm: () => searchBoxRef.current?.querySelector('input') as HTMLInputElement,
    focusInput: focusSearchInput,
    keyboardProps: {
      isLoading,
    },
  });

  return (
    <div className="h-full flex flex-col">
      <InstantSearch
        indexName={algolia.mainIndexName}
        searchClient={searchClient}
        future={{
          preserveSharedStateOnUnmount: true,
        }}
        insights={true}
      >
        <div className={clsx('bg-cms-bg-base flex z-[1]')}>
          <SearchBox
            classNames={{
              root: clsx('h-[57px] w-full md:rounded-t-docs_xl relative border-0 border-solid', 'border-b border-cms-border-base', 'bg-transparent'),
              form: clsx('h-full md:rounded-t-docs_xl bg-transparent'),
              input: clsx(
                'w-[calc(100%-40px)] h-full px-docs_1 py-docs_0.75 text-cms-fg-base',
                'placeholder:text-cms-fg-muted bg-cms-bg-base',
                'md:rounded-t-docs_xl text-compact-large sm:text-compact-medium',
                'appearance-none search-cancel:hidden border-0 active:outline-none focus:outline-none',
              ),
              submit: clsx('absolute top-[18px] left-docs_1 btn-clear p-0'),
              reset: clsx('absolute top-[18px] right-docs_1', 'btn-clear'),
              loadingIndicator: clsx('absolute top-[18px] right-docs_1'),
            }}
            submitIconComponent={() => <></>}
            resetIconComponent={() => <span className="text-cms-fg-muted text-compact-small-plus hover:text-cms-fg-subtle">Clear</span>}
            placeholder="Find something..."
            autoFocus
            formRef={searchBoxRef as React.RefObject<HTMLFormElement>}
            loadingIconComponent={() => <SpinnerLoading />}
          />
        </div>
        <div className={clsx('md:flex-initial flex flex-col', 'h-[calc(100%-75px)] lg:max-h-[calc(100%-100px)] lg:min-h-[calc(100%-100px)]')}>
          <SearchFilters />
          <SearchEmptyQueryBoundary fallback={<SearchSuggestions suggestions={suggestions} />}>
            <SearchCallout />
            <SearchHitsWrapper configureProps={{}} checkInternalPattern={checkInternalPattern} />
          </SearchEmptyQueryBoundary>
        </div>
      </InstantSearch>
      <SearchFooter />
    </div>
  );
};
