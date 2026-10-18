'use client';

import { Progress as ProgressPrimitive } from '@base-ui/react/progress';
import { clx } from '@/utils/clx';

/**
 * Migrated from the nibleaf design system (Base UI primitives), restyled with
 * cms `ui-*` tokens: subtle track + interactive (blue) indicator.
 */
function Progress({ className, children, value, ...props }: ProgressPrimitive.Root.Props) {
  return (
    <ProgressPrimitive.Root value={value} data-slot="progress" className={clx('flex flex-wrap gap-3', className)} {...props}>
      {children}
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </ProgressPrimitive.Root>
  );
}

function ProgressTrack({ className, ...props }: ProgressPrimitive.Track.Props) {
  return (
    <ProgressPrimitive.Track
      className={clx('bg-ui-bg-component-pressed relative flex h-1.5 w-full items-center overflow-x-hidden rounded-full', className)}
      data-slot="progress-track"
      {...props}
    />
  );
}

function ProgressIndicator({ className, ...props }: ProgressPrimitive.Indicator.Props) {
  return (
    <ProgressPrimitive.Indicator data-slot="progress-indicator" className={clx('bg-ui-bg-interactive h-full transition-all', className)} {...props} />
  );
}

function ProgressLabel({ className, ...props }: ProgressPrimitive.Label.Props) {
  return <ProgressPrimitive.Label className={clx('txt-compact-small-plus text-ui-fg-base', className)} data-slot="progress-label" {...props} />;
}

function ProgressValue({ className, ...props }: ProgressPrimitive.Value.Props) {
  return (
    <ProgressPrimitive.Value
      className={clx('txt-compact-small text-ui-fg-muted ms-auto tabular-nums', className)}
      data-slot="progress-value"
      {...props}
    />
  );
}

export { Progress, ProgressIndicator, ProgressLabel, ProgressTrack, ProgressValue };
