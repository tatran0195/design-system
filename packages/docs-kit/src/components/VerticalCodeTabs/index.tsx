'use client';

import clsx from 'clsx';
import { CodeBlock, type CodeBlockProps } from '../CodeBlock';

export type VerticalCodeTab = {
  title: string;
  code: CodeBlockProps;
} & Record<string, unknown>;

export type VerticalCodeTabsProps = {
  tabs: VerticalCodeTab[];
  className?: string;
  selectedTabIndex: number;
  setSelectedTabIndex: (value: number) => void;
};

export const VerticalCodeTabs = ({ tabs, className, selectedTabIndex, setSelectedTabIndex }: VerticalCodeTabsProps) => (
  <div
    className={clsx('rounded-[20px] bg-cms-bg-subtle p-docs_0.5', 'shadow-elevation-modal dark:shadow-elevation-modal-dark', className)}
    data-testid="vertical-code-tabs-container"
  >
    <div
      className={clsx(
        'rounded-docs_lg bg-cms-contrast-bg-base h-full',
        'shadow-elevation-code-block dark:shadow-elevation-code-block-dark',
        'flex flex-col',
      )}
    >
      <div className={clsx('px-docs_1 py-docs_0.75', 'flex gap-[6px] items-center')}>
        {new Array(3).fill(0).map((_, index) => (
          <span
            className={clsx('inline-block rounded-full w-[10px] h-[10px]', 'bg-cms-contrast-border-bot border border-cms-contrast-border-bot')}
            key={index}
            data-testid="vertical-code-tabs-dot"
          />
        ))}
      </div>
      <div className={clsx('flex flex-1 gap-[6px] items-start px-[5px] pb-[5px]')}>
        <ul className="2xl:w-[180px] flex flex-col gap-[6px] shrink-0">
          {tabs.map((tab, index) => (
            <li
              className={clsx(
                'px-docs_0.75 py-[11px]',
                'rounded-docs_DEFAULT border border-cms-contrast-border-bot',
                'text-code-body font-monospace cursor-pointer',
                selectedTabIndex === index && 'text-cms-contrast-fg-primary bg-cms-contrast-border-bot',
                selectedTabIndex !== index && 'text-cms-contrast-fg-secondary bg-cms-contrast-bg-subtle hover:bg-cms-contrast-border-bot',
              )}
              onClick={() => setSelectedTabIndex(index)}
              key={index}
            >
              {tab.title}
            </li>
          ))}
        </ul>
        <div className="flex-1 h-[388px] max-w-full overflow-hidden rounded-docs_DEFAULT [&_pre]:min-h-full">
          <CodeBlock
            {...tabs[selectedTabIndex].code}
            noCopy={true}
            noReport={true}
            noAskAi={true}
            forceNoTitle={true}
            wrapperClassName="h-full !rounded-docs_DEFAULT"
            className={clsx('overflow-auto h-full max-h-full !mb-0 !rounded-docs_DEFAULT', '!border !border-cms-contrast-border-bot')}
            innerClassName="h-full"
            animateTokenHighlights
            overrideColors={{
              bg: 'bg-cms-contrast-bg-subtle',
              innerBg: 'bg-cms-contrast-bg-subtle',
              lineNumbersBg: 'bg-cms-contrast-bg-subtle',
              boxShadow: 'shadow-none',
            }}
          />
        </div>
      </div>
    </div>
  </div>
);
