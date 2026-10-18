import clsx from 'clsx';
import { Kbd } from '@/components/Kbd';

export const SearchFooter = () => (
  <div className={clsx('py-docs_0.75 hidden md:flex items-center justify-end px-docs_1', 'border-cms-border-base border-t', 'bg-cms-bg-field z-10')}>
    <div className="flex items-center gap-docs_0.75">
      <div className="flex items-center gap-docs_0.5">
        <span className={clsx('text-cms-fg-subtle', 'text-compact-x-small-plus')}>Navigation</span>
        <span className="gap-[5px] flex">
          <Kbd className={clsx('!bg-cms-bg-field-component !border-cms-border-strong', '!text-cms-fg-subtle h-[18px] w-[18px] p-0')}>↑</Kbd>
          <Kbd className={clsx('!bg-cms-bg-field-component !border-cms-border-strong', '!text-cms-fg-subtle h-[18px] w-[18px] p-0')}>↓</Kbd>
        </span>
      </div>
      <div className={clsx('h-docs_0.75 w-px bg-cms-border-strong')} />
      <div className="flex items-center gap-docs_0.5">
        <span className={clsx('text-cms-fg-subtle', 'text-compact-x-small-plus')}>Open Result</span>
        <Kbd className={clsx('!bg-cms-bg-field-component !border-cms-border-strong', '!text-cms-fg-subtle h-[18px] w-[18px] p-0')}>↵</Kbd>
      </div>
    </div>
  </div>
);
