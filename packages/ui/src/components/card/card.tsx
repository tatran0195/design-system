import type * as React from 'react';
import { clx } from '@/utils/clx';

/**
 * Migrated from the nibleaf design system, restyled with cms `ui-*` tokens
 * (`bg-ui-bg-component` + `shadow-elevation-card-rest` replace the original
 * `bg-card`/`ring-foreground/10` look).
 */

function Card({ className, size = 'default', ...props }: React.ComponentProps<'div'> & { size?: 'default' | 'sm' }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={clx(
        'group/card txt-compact-medium shadow-elevation-card-rest flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl bg-ui-bg-component py-(--card-spacing) text-ui-fg-base [--card-spacing:--spacing(6)] has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(4)] *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl',
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={clx(
        'group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[minmax(0,1fr)_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [&.border-b]:pb-(--card-spacing)',
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={clx('text-base leading-normal font-medium group-data-[size=sm]/card:txt-compact-medium-plus', className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-description" className={clx('txt-compact-medium text-ui-fg-muted', className)} {...props} />;
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-action" className={clx('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)} {...props} />;
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={clx('px-(--card-spacing)', className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={clx('flex items-center rounded-b-xl px-(--card-spacing) [&.border-t]:pt-(--card-spacing)', className)}
      {...props}
    />
  );
}

export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
