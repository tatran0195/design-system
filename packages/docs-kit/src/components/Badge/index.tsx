import clsx from 'clsx';
import type React from 'react';
import { ShadedBgIcon } from '../Icons/ShadedBg';

export type BadgeVariant = 'purple' | 'orange' | 'green' | 'blue' | 'red' | 'neutral' | 'code';

export type BadgeType = 'default' | 'shaded';

export type BadgeProps = {
  className?: string;
  childrenWrapperClassName?: string;
  variant: BadgeVariant;
  badgeType?: BadgeType;
} & React.HTMLAttributes<HTMLSpanElement>;

export const Badge = ({ className, variant, badgeType = 'default', children, childrenWrapperClassName, ...props }: BadgeProps) => {
  return (
    <span
      className={clsx(
        'text-compact-x-small-plus text-center',
        badgeType === 'default' && 'px-docs_0.25 py-0 rounded-docs_sm border border-solid',
        variant === 'purple' && 'bg-cms-tag-purple-bg text-cms-tag-purple-text border-cms-tag-purple-border',
        variant === 'orange' && 'bg-cms-tag-orange-bg text-cms-tag-orange-text border-cms-tag-orange-border',
        variant === 'green' && 'bg-cms-tag-green-bg text-cms-tag-green-text border-cms-tag-green-border',
        variant === 'blue' && 'bg-cms-tag-blue-bg text-cms-tag-blue-text border-cms-tag-blue-border',
        variant === 'red' && 'bg-cms-tag-red-bg text-cms-tag-red-text border-cms-tag-red-border',
        variant === 'neutral' && 'bg-cms-tag-neutral-bg text-cms-tag-neutral-text border-cms-tag-neutral-border',
        variant === 'code' && 'bg-cms-contrast-bg-subtle text-cms-contrast-fg-secondary border-cms-contrast-border-bot',
        badgeType === 'shaded' && 'px-[3px] !bg-transparent relative',
        // needed for tailwind utilities
        'badge',
        className,
      )}
      {...props}
    >
      {badgeType === 'shaded' && <ShadedBgIcon variant={variant} className={clsx('absolute top-0 left-0 w-full h-full')} />}
      <span className={clsx(badgeType === 'shaded' && 'relative z-[1]', childrenWrapperClassName)}>{children}</span>
    </span>
  );
};
