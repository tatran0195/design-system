import { ChevronDown, ChevronRight } from 'lucide-react';
import { type CSSProperties, type ReactNode, useId, useState } from 'react';
import { z } from 'zod';
import { siteT } from '@/shared/i18n/site';
import { PageIcon } from '@/shared/ui/page-icon';
import { cn } from '@/shared/ui/utils';
import { truthyAttr } from './attributes';
export function AccordionGroup({ children }: { children?: ReactNode }) {
  return <div className="my-5 divide-y divide-border overflow-hidden rounded-xl border border-border">{children}</div>;
}

export function Accordion({
  title,
  defaultOpen,
  children,
  language,
}: {
  title?: string;
  defaultOpen?: string | boolean;
  children?: ReactNode;
  language?: string;
}) {
  const [open, setOpen] = useState(() => truthyAttr(defaultOpen));
  const accordionId = useId();
  const t = siteT(language);
  return (
    <div>
      <button
        id={`${accordionId}-trigger`}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`${accordionId}-panel`}
        className="flex w-full cursor-pointer items-center justify-between gap-2 px-4 py-3 text-start font-medium"
      >
        {title ?? t('details')}
        <ChevronDown className={cn('size-4 shrink-0 transition-transform', open && 'rotate-180')} aria-hidden />
      </button>
      <section
        id={`${accordionId}-panel`}
        aria-labelledby={`${accordionId}-trigger`}
        hidden={!open}
        className="px-4 pb-4 text-sm [&>:first-child]:mt-0 [&>:last-child]:mb-0"
      >
        {children}
      </section>
    </div>
  );
}

export function Frame({ caption, children }: { caption?: string; children?: ReactNode }) {
  return (
    <figure className="my-5 overflow-hidden rounded-xl border border-border bg-muted/30 p-3">
      <div className="overflow-hidden rounded-lg [&>img]:my-0 [&>img]:w-full">{children}</div>
      {caption ? <figcaption className="mt-2 text-center text-muted-foreground text-xs">{caption}</figcaption> : null}
    </figure>
  );
}

export function Tooltip({ tip, children }: { tip?: string; children?: ReactNode }) {
  return (
    <span className="cursor-help underline decoration-dotted underline-offset-2" title={tip}>
      {children}
    </span>
  );
}

export function Icon({ icon, name, color, size }: { icon?: string; name?: string; color?: string; size?: string | number }) {
  const resolved = icon ?? name;
  if (!resolved) {
    return null;
  }
  const parsedSize = z.coerce
    .number()
    .min(1)
    .max(128)
    .safeParse(String(size ?? '').replace(/[^0-9.]/g, ''));
  const px = parsedSize.success ? parsedSize.data : undefined;
  const style: CSSProperties = { color };
  if (px) {
    style.width = px;
    style.height = px;
  }
  return (
    <span className="inline-flex align-text-bottom" style={style}>
      <PageIcon name={resolved} className={px ? 'h-full w-full' : 'size-[1.1em]'} />
    </span>
  );
}

export function Expandable({
  title,
  defaultOpen,
  children,
  language,
}: {
  title?: string;
  defaultOpen?: string | boolean;
  children?: ReactNode;
  language?: string;
}) {
  const [open, setOpen] = useState(() => truthyAttr(defaultOpen));
  const expandableId = useId();
  const t = siteT(language);
  return (
    <div className="my-4 overflow-hidden rounded-xl border border-border">
      <button
        id={`${expandableId}-trigger`}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={`${expandableId}-panel`}
        className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-start font-medium text-sm"
      >
        <ChevronRight className={cn('size-4 shrink-0 transition-transform rtl:-scale-x-100', open && 'rotate-90')} aria-hidden />
        {title ?? t('showProperties')}
      </button>
      <section
        id={`${expandableId}-panel`}
        aria-labelledby={`${expandableId}-trigger`}
        hidden={!open}
        className="border-border border-t px-4 py-3 [&>:first-child]:mt-0 [&>:last-child]:mb-0"
      >
        {children}
      </section>
    </div>
  );
}

export function Update({ label, description, children }: { label?: string; description?: string; children?: ReactNode }) {
  return (
    <div className="my-6 border-border border-s ps-6">
      {label ? (
        <span className="-ms-[calc(1.5rem+0.5px)] mb-2 inline-block rounded-full border border-border bg-card px-3 py-0.5 font-medium text-xs">
          {label}
        </span>
      ) : null}
      {description ? <div className="mb-2 text-muted-foreground text-sm">{description}</div> : null}
      <div className="[&>:first-child]:mt-0 [&>:last-child]:mb-0">{children}</div>
    </div>
  );
}
