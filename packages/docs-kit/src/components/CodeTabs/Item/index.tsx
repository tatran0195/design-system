'use client';

import clsx from 'clsx';
import type React from 'react';
import { useColorMode } from '@/providers/ColorMode';
import { useScrollPositionBlocker } from '../../../hooks/use-scroll-utils';
import type { BaseTabType } from '../../../hooks/use-tabs';

type CodeTabProps = BaseTabType & {
  // Children are handled in MDX to allow for code blocks and inline code to be rendered
  children: React.ReactNode;
  isSelected?: boolean;
  blockStyle?: string;
  changeSelectedTab?: (tab: BaseTabType) => void;
  pushRef?: (tabButton: HTMLButtonElement | null) => void;
};

export const CodeTab = ({ label, value, isSelected = false, blockStyle = 'loud', changeSelectedTab, pushRef }: CodeTabProps) => {
  const { colorMode } = useColorMode();
  const { blockElementScrollPositionUntilNextRender } = useScrollPositionBlocker();

  return (
    <li>
      <button
        className={clsx(
          'text-compact-x-small-plus font-base xs:border-0 pb-docs_0.5 relative',
          !isSelected && [
            blockStyle === 'loud' && 'text-cms-contrast-fg-secondary',
            blockStyle === 'subtle' && [
              colorMode === 'light' && 'text-cms-fg-subtle hover:bg-cms-bg-base',
              colorMode === 'dark' && 'text-cms-contrast-fg-secondary hover:bg-cms-code-bg-base',
            ],
          ],
          isSelected && [
            blockStyle === 'loud' && 'text-cms-contrast-fg-primary',
            blockStyle === 'subtle' && [
              colorMode === 'light' && 'xs:border-cms-border-base text-cms-contrast-fg-primary',
              colorMode === 'dark' && 'xs:border-cms-code-border text-cms-contrast-fg-primary',
            ],
          ],
        )}
        ref={(tabButton) => pushRef?.(tabButton)}
        onClick={(e) => {
          blockElementScrollPositionUntilNextRender(e.target as HTMLButtonElement);
          changeSelectedTab?.({ label, value });
        }}
        aria-selected={isSelected}
        role="tab"
      >
        {label}
      </button>
    </li>
  );
};
