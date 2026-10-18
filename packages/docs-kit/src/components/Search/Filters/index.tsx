'use client';

import clsx from 'clsx';
import { useSearch } from '@/providers/Search';

export const SearchFilters = () => {
  const { indices, selectedIndex, setSelectedIndex } = useSearch();
  if (indices.length <= 1) {
    return null;
  }
  return (
    <div className="pt-docs_0.75 px-docs_0.5 justify-center items-center w-full">
      <div className="flex flex-wrap bg-cms-bg-disabled rounded-docs_DEFAULT p-docs_0.125">
        {indices.map((index) => (
          <button
            key={index.value}
            className={clsx(
              'text-compact-small-plus flex-1 p-docs_0.25',
              selectedIndex === index.value && [
                'rounded-docs_sm text-cms-fg-base bg-cms-bg-base',
                'shadow-elevation-card-rest dark:shadow-elevation-card-rest-dark',
              ],
              selectedIndex !== index.value && 'text-cms-fg-muted',
            )}
            onClick={() => setSelectedIndex(index.value)}
          >
            {index.title}
          </button>
        ))}
      </div>
    </div>
  );
};
