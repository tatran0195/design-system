import { Link as LinkIcon } from 'lucide-react';
import { Children, isValidElement, type ReactNode } from 'react';
import { hasIcon, PageIcon } from '@/shared/ui/page-icon';
import { cn } from '@/shared/ui/utils';
export function CardGroup({ cols, children }: { cols?: string | number; children?: ReactNode }) {
  const n = Math.min(4, Math.max(1, Number(String(cols ?? 2).replace(/[^0-9]/g, '')) || 2));
  const colsClass = { 1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-4' }[n];
  return <div className={cn('my-5 grid grid-cols-1 gap-4', colsClass)}>{children}</div>;
}

export function Card({ title, href, icon, children }: { title?: string; href?: string; icon?: string; children?: ReactNode }) {
  const inner = (
    <>
      {icon ? (
        <span className="mb-3 inline-flex text-primary" aria-hidden>
          {hasIcon(icon) ? (
            <PageIcon name={icon} className="size-5" />
          ) : (
            <span className="grid size-5 place-items-center rounded-md bg-primary/10 font-mono text-[11px]">{icon[0]?.toUpperCase()}</span>
          )}
        </span>
      ) : null}
      {title ? <div className="font-semibold">{title}</div> : null}
      {children ? <div className="mt-1.5 text-muted-foreground text-sm [&>:first-child]:mt-0 [&>:last-child]:mb-0">{children}</div> : null}
    </>
  );
  const base = 'block rounded-xl border border-border bg-card p-5 transition-all';
  return href ? (
    <a data-theme-component="card" href={href} className={cn(base, 'hover:-translate-y-px hover:border-primary/50 hover:shadow-sm')}>
      {inner}
    </a>
  ) : (
    <div className={base} data-theme-component="card">
      {inner}
    </div>
  );
}

export function Columns({ children }: { children?: ReactNode }) {
  const count = Math.min(4, Math.max(1, Children.toArray(children).filter(isValidElement).length));
  const colsClass = { 1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4' }[count];
  return <div className={cn('my-5 grid grid-cols-1 gap-4', colsClass)}>{children}</div>;
}

export function Column({ children }: { children?: ReactNode }) {
  return <div className="rounded-xl border border-border bg-card p-5 [&>:first-child]:mt-0 [&>:last-child]:mb-0">{children}</div>;
}

export function MdxButton({ href, variant, children }: { href?: string; variant?: string; children?: ReactNode }) {
  return (
    <a
      href={href}
      data-variant={variant}
      className={cn(
        'inline-flex items-center rounded-lg px-3 py-1.5 font-semibold text-sm no-underline',
        variant === 'outline' ? 'border border-border bg-card text-foreground' : 'bg-primary text-primary-foreground',
      )}
    >
      {children}
    </a>
  );
}

export function RelatedContent({ title, children }: { title?: string; children?: ReactNode }) {
  return (
    <section className="my-8" data-theme-component="related-content">
      {title ? <h2 className="mb-3 text-lg">{title}</h2> : null}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function RelatedCard({
  title,
  description,
  href,
  icon,
  children,
}: {
  title?: string;
  description?: string;
  href?: string;
  icon?: string;
  children?: ReactNode;
}) {
  const body = (
    <>
      <span className="mt-0.5 text-primary" aria-hidden>
        {icon && hasIcon(icon) ? <PageIcon name={icon} className="size-4" /> : <LinkIcon className="size-4" />}
      </span>
      <span className="min-w-0">
        {title ? <span className="block font-semibold text-foreground">{title}</span> : null}
        {description ? <span className="mt-1 block text-muted-foreground text-sm">{description}</span> : null}
        {children ? <span className="mt-1 block text-muted-foreground text-sm [&>:first-child]:mt-0 [&>:last-child]:mb-0">{children}</span> : null}
      </span>
    </>
  );
  const className = 'flex gap-3 rounded-xl border border-border bg-card p-4 no-underline transition-colors hover:border-primary/50';
  return href ? (
    <a href={href} className={className} data-theme-component="related-card">
      {body}
    </a>
  ) : (
    <div className={className} data-theme-component="related-card">
      {body}
    </div>
  );
}
