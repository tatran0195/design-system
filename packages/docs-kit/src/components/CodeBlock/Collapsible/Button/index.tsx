'use client';

import { Button } from '@cms/ui';
import clsx from 'clsx';
import type { CollapsibleReturn } from '../../../../hooks/use-collapsible';

export type CodeBlockCollapsibleButtonProps = {
  type: 'start' | 'end';
  expandButtonLabel?: string;
  className?: string;
} & Omit<CollapsibleReturn, 'getCollapsibleElms'>;

export const CodeBlockCollapsibleButton = ({
  type,
  expandButtonLabel = 'Show more',
  collapsed,
  setCollapsed,
  className,
}: CodeBlockCollapsibleButtonProps) => {
  if (!collapsed) {
    return <></>;
  }

  return (
    <>
      {type === 'start' && (
        <Button
          className={clsx(
            'font-base w-full !p-docs_0.5 !shadow-none z-10',
            'bg-cms-contrast-button hover:bg-cms-contrast-button-hover',
            'txt-compact-xsmall text-cms-contrast-fg-secondary',
            type === 'start' && 'rounded-t-docs_DEFAULT rounded-b-none',
            className,
          )}
          data-testid="collapsible-button-start"
          onClick={() => setCollapsed(false)}
        >
          {expandButtonLabel}
        </Button>
      )}
      {type === 'end' && (
        <Button
          className={clsx(
            'font-base w-full !p-docs_0.5 !shadow-none z-10',
            'bg-cms-contrast-button hover:bg-cms-contrast-button-hover',
            'txt-compact-xsmall text-cms-contrast-fg-secondary',
            'rounded-t-none rounded-b-docs_DEFAULT',
            className,
          )}
          data-testid="collapsible-button-end"
          onClick={() => setCollapsed(false)}
        >
          {expandButtonLabel}
        </Button>
      )}
    </>
  );
};
