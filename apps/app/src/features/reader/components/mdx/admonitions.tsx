import { AlertTriangle, Check, Info, Lightbulb, type LucideIcon, OctagonAlert } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { type CalloutType, normalizeType } from '@/features/reader/components/mdx-config';
import { cn } from '@/shared/ui/utils';

const CALLOUT: Record<CalloutType, { icon: LucideIcon; token: string }> = {
  note: { icon: Info, token: 'var(--theme-info,var(--primary))' },
  info: { icon: Info, token: 'var(--theme-info,var(--primary))' },
  tip: { icon: Lightbulb, token: 'var(--theme-success,var(--primary))' },
  check: { icon: Check, token: 'var(--theme-success,var(--primary))' },
  warning: { icon: AlertTriangle, token: 'var(--theme-warning,var(--primary))' },
  danger: { icon: OctagonAlert, token: 'var(--theme-danger,var(--destructive))' },
};

export function Callout({ type, children }: { type?: string; children?: ReactNode }) {
  const meta = CALLOUT[normalizeType(type)];
  const Icon = meta.icon;
  return (
    <div
      className="my-5 flex gap-3 rounded-xl border p-4 text-foreground"
      data-theme-component="callout"
      role="note"
      style={
        {
          '--callout-color': meta.token,
          '--callout-border': `color-mix(in oklab,${meta.token} 38%,transparent)`,
          '--callout-bg': `color-mix(in oklab,${meta.token} 10%,transparent)`,
        } as CSSProperties
      }
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1 [&>:first-child]:mt-0 [&>:last-child]:mb-0">{children}</div>
    </div>
  );
}

export function Banner({ type, children }: { type?: string; children?: ReactNode }) {
  return (
    <div
      className={cn(
        'my-5 rounded-xl border px-4 py-3 text-sm',
        type === 'warning' ? 'border-amber-500/35 bg-amber-500/10' : 'border-primary/30 bg-primary/8',
      )}
    >
      {children}
    </div>
  );
}

export function Badge({ color, children }: { color?: string; children?: ReactNode }) {
  return (
    <span data-color={color} className="inline-flex rounded-full bg-muted px-2 py-0.5 font-semibold text-[0.78em] text-foreground align-middle">
      {children}
    </span>
  );
}
