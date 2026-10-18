import {
  Children,
  isValidElement,
  type ReactElement,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  useId,
  useRef,
  useState,
} from 'react';
import { siteT } from '@/shared/i18n/site';
import { cn } from '@/shared/ui/utils';

function handleTabKeyDown(
  event: ReactKeyboardEvent<HTMLButtonElement>,
  current: number,
  count: number,
  language: string | undefined,
  setActive: (index: number) => void,
  tabRefs: Array<HTMLButtonElement | null>,
) {
  const explicitDirection = event.currentTarget.closest('[dir]')?.getAttribute('dir');
  const rtl = explicitDirection ? explicitDirection === 'rtl' : /^(ar|fa|he|ur)(-|$)/i.test(language ?? '');
  let next: number | undefined;
  if (event.key === 'Home') {
    next = 0;
  } else if (event.key === 'End') {
    next = count - 1;
  } else if (event.key === 'ArrowRight') {
    next = (current + (rtl ? -1 : 1) + count) % count;
  } else if (event.key === 'ArrowLeft') {
    next = (current + (rtl ? 1 : -1) + count) % count;
  }
  if (next === undefined) {
    return;
  }
  event.preventDefault();
  setActive(next);
  tabRefs[next]?.focus();
}

export function Tabs({ children, language }: { children?: ReactNode; language?: string }) {
  const tabs = Children.toArray(children).filter((child) => isValidElement<{ title?: string; children?: ReactNode }>(child));
  const [active, setActive] = useState(0);
  const tabsId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const t = siteT(language);
  if (tabs.length === 0) return null;
  return (
    <div className="my-5">
      <div
        className="flex gap-1 overflow-x-auto border-border border-b"
        data-theme-component="tabs-list"
        role="tablist"
        aria-orientation="horizontal"
      >
        {tabs.map((tab, i) => (
          <button
            key={tab.key}
            ref={(element) => {
              tabRefs.current[i] = element;
            }}
            type="button"
            onClick={() => setActive(i)}
            onKeyDown={(event) => handleTabKeyDown(event, i, tabs.length, language, setActive, tabRefs.current)}
            id={`${tabsId}-tab-${i}`}
            role="tab"
            aria-controls={`${tabsId}-panel-${i}`}
            aria-selected={i === active}
            tabIndex={i === active ? 0 : -1}
            className={cn(
              '-mb-px shrink-0 cursor-pointer border-b-2 px-3 py-2 font-medium text-sm transition-colors',
              i === active ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.props.title ?? `${t('tab')} ${i + 1}`}
          </button>
        ))}
      </div>
      {tabs.map((tab, i) => (
        <div
          key={tab.key}
          id={`${tabsId}-panel-${i}`}
          role="tabpanel"
          aria-labelledby={`${tabsId}-tab-${i}`}
          hidden={i !== active}
          className="pt-3 [&>:first-child]:mt-0 [&>:last-child]:mb-0"
        >
          {tab}
        </div>
      ))}
    </div>
  );
}

export function Tab({ children }: { title?: string; children?: ReactNode }) {
  return <div className="[&>:first-child]:mt-0 [&>:last-child]:mb-0">{children}</div>;
}

type CodeProps = { className?: string; 'data-title'?: string; 'data-lang'?: string };

type PreElement = ReactElement<{ 'data-title'?: string; 'data-lang'?: string; children?: { props?: CodeProps } }>;

export function CodeGroup({ children, language }: { children?: ReactNode; language?: string }) {
  const blocks = Children.toArray(children).filter((child) =>
    isValidElement<{ 'data-title'?: string; 'data-lang'?: string; children?: { props?: CodeProps } }>(child),
  );
  const [active, setActive] = useState(0);
  const codeGroupId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  if (blocks.length === 0) {
    return null;
  }
  const labelFor = (block: PreElement, index: number): string => {
    const code = block.props?.children;
    const title = block.props?.['data-title'] ?? code?.props?.['data-title'];
    if (title) {
      return title;
    }
    const codeLanguage = /language-([\w+#-]+)/.exec(code?.props?.className ?? '')?.[1] ?? block.props?.['data-lang'] ?? code?.props?.['data-lang'];
    return codeLanguage ? codeLanguage.toUpperCase() : `${siteT(language)('tab')} ${index + 1}`;
  };
  return (
    <div className="my-5 overflow-hidden rounded-xl border border-border">
      <div className="flex gap-1 overflow-x-auto border-border border-b bg-muted/40 px-2 pt-1.5" role="tablist" aria-orientation="horizontal">
        {blocks.map((block, index) => (
          <button
            key={block.key}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            type="button"
            onClick={() => setActive(index)}
            onKeyDown={(event) => handleTabKeyDown(event, index, blocks.length, language, setActive, tabRefs.current)}
            id={`${codeGroupId}-tab-${index}`}
            role="tab"
            aria-controls={`${codeGroupId}-panel-${index}`}
            aria-selected={index === active}
            tabIndex={index === active ? 0 : -1}
            className={cn(
              '-mb-px shrink-0 cursor-pointer rounded-t-md border-b-2 px-3 py-1.5 font-mono text-xs transition-colors',
              index === active ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {labelFor(block, index)}
          </button>
        ))}
      </div>
      {blocks.map((block, index) => (
        <div
          key={block.key}
          id={`${codeGroupId}-panel-${index}`}
          role="tabpanel"
          aria-labelledby={`${codeGroupId}-tab-${index}`}
          hidden={index !== active}
          className="[&>div]:my-0 [&>div]:rounded-none [&>div]:border-0"
        >
          {block}
        </div>
      ))}
    </div>
  );
}
