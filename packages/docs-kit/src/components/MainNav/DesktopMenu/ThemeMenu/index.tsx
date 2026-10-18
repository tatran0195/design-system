'use client';

import { EllipseMiniSolid } from '@cms/icons';
import clsx from 'clsx';
import { useColorMode } from '../../../../providers/ColorMode';

export const MainNavThemeMenu = () => {
  const { colorMode, setColorMode } = useColorMode();

  return (
    <>
      <div
        className={clsx(
          'flex items-center gap-docs_0.5',
          'py-docs_0.25 px-docs_0.5',
          'rounded-docs_xs text-compact-x-small-plus',
          'text-cms-fg-subtle',
        )}
      >
        Theme
      </div>
      <div className="px-docs_0.25">
        <div
          className={clsx(
            'flex items-center gap-docs_0.5',
            'py-docs_0.25 px-docs_0.5 cursor-pointer',
            'rounded-docs_xs text-cms-fg-base',
            'hover:bg-cms-bg-component-hover',
          )}
          tabIndex={-1}
          onClick={() => setColorMode('light')}
          data-testid="light-option"
        >
          <EllipseMiniSolid className={clsx(colorMode !== 'light' && 'invisible')} data-testid="ellipse-icon" />
          <span className={clsx(colorMode !== 'light' && 'text-compact-small', colorMode === 'light' && 'text-compact-small-plus')}>Light</span>
        </div>
      </div>
      <div className="px-docs_0.25">
        <div
          className={clsx(
            'flex items-center gap-docs_0.5',
            'py-docs_0.25 px-docs_0.5 cursor-pointer',
            'rounded-docs_xs text-cms-fg-base',
            'hover:bg-cms-bg-component-hover',
          )}
          tabIndex={-1}
          onClick={() => setColorMode('dark')}
          data-testid="dark-option"
        >
          <EllipseMiniSolid className={clsx(colorMode !== 'dark' && 'invisible')} data-testid="ellipse-icon" />
          <span className={clsx(colorMode !== 'dark' && 'text-compact-small', colorMode === 'dark' && 'text-compact-small-plus')}>Dark</span>
        </div>
      </div>
    </>
  );
};
