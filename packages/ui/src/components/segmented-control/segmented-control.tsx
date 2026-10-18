import type { ComponentProps } from 'react';
import { clx } from '@/utils/clx';

/**
 * Migrated from the nibleaf design system, restyled with cms `ui-*` tokens.
 * The shell owns the outer size; items use only its remaining inner height.
 */
function SegmentedControl({ className, density = 'default', ...props }: ComponentProps<'div'> & { density?: 'default' | 'compact' }) {
  return (
    <div
      role="group"
      data-slot="segmented-control"
      data-density={density}
      className={clx(
        'inline-flex min-h-(--segmented-height) min-w-0 flex-wrap items-stretch gap-0.5 rounded-lg bg-ui-bg-subtle p-(--control-group-inset) [--control-group-inset:0.125rem] [--segmented-height:2rem] data-[density=compact]:[--segmented-height:1.75rem]',
        className,
      )}
      {...props}
    />
  );
}

function SegmentedControlItem({ className, active, ...props }: ComponentProps<'button'> & { active: boolean }) {
  return (
    <button
      type="button"
      data-slot="segmented-control-item"
      aria-pressed={active}
      className={clx(
        'txt-compact-small-plus inline-flex min-h-[calc(var(--segmented-height)-2*var(--control-group-inset))] min-w-[calc(var(--segmented-height)-2*var(--control-group-inset))] flex-auto cursor-pointer items-center justify-center gap-1.5 whitespace-normal rounded-md px-2 py-1 text-center transition-colors outline-none focus-visible:shadow-borders-interactive-with-focus disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:shrink-0',
        active ? 'shadow-borders-base bg-ui-bg-base text-ui-fg-base' : 'text-ui-fg-muted hover:text-ui-fg-base',
        className,
      )}
      {...props}
    />
  );
}

export { SegmentedControl, SegmentedControlItem };
