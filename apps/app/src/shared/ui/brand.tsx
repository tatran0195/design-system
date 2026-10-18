import { clx } from '@cms/ui';
import type { ComponentProps } from 'react';
export function NibleafMark({ className, ...props }: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={clx('size-8 shrink-0 text-ui-fg-base', className)} {...props}>
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <path d="M10 9h8l4 4v10H10V9Z" stroke="var(--bg-base)" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M18 9v5h4M13 18h6M13 21h4" stroke="var(--bg-base)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
export function NibleafWordmark({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span {...props} className={clx('font-semibold tracking-tight text-ui-fg-base', className)}>
      CMS
    </span>
  );
}
