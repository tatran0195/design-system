import { Progress } from '@cms/ui';
import type { CSSProperties } from 'react';
export interface ProgressBarProps {
  duration?: number;
  label?: string;
}
/** Indeterminate loading presentation backed by the primary CMS progress primitive. */
export function ProgressBar({ duration = 2, label = 'Loading' }: ProgressBarProps) {
  return (
    <Progress
      value={null}
      aria-label={label}
      className="size-full gap-0 [&_[data-slot=progress-track]]:h-full [&_[data-slot=progress-track]]:rounded-none [&_[data-slot=progress-indicator]]:w-1/2 [&_[data-slot=progress-indicator]]:animate-pulse [&_[data-slot=progress-indicator]]:[animation-duration:var(--dashboard-progress-duration)]"
      style={{ '--dashboard-progress-duration': `${Math.max(0.1, duration)}s` } as CSSProperties}
    />
  );
}
