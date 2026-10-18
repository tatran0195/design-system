import clsx from 'clsx';
import type React from 'react';

export type SearchSuggestionItemType = {
  onClick: () => void;
} & React.AllHTMLAttributes<HTMLDivElement>;

export const SearchSuggestionItem = ({ children, onClick, className, ...rest }: SearchSuggestionItemType) => (
  <div
    className={clsx(
      'flex items-center justify-between gap-docs_0.75',
      'cursor-pointer rounded-docs_sm p-docs_0.5',
      'hover:bg-cms-bg-base-hover',
      'focus:bg-cms-bg-base-hover',
      'focus:outline-none last:mb-docs_1',
      'text-cms-fg-base text-compact-small',
      className,
    )}
    onClick={onClick}
    data-hit
    {...rest}
  >
    {children}
  </div>
);
