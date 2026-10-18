import clsx from 'clsx';
import type React from 'react';

export type InputTextProps = {
  className?: string;
  addGroupStyling?: boolean;
  passedRef?: React.Ref<HTMLInputElement>;
} & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

export const InputText = ({ addGroupStyling = false, className, passedRef, ...props }: InputTextProps) => (
  <input
    {...props}
    className={clsx(
      'bg-cms-bg-field-component shadow-border-base dark:shadow-border-base-dark',
      'rounded-docs_sm px-docs_0.5',
      'hover:bg-cms-bg-field-component-hover',
      addGroupStyling && 'group-hover:bg-cms-bg-field-component-hover',
      'focus:border-cms-border-interactive',
      'active:border-cms-border-interactive',
      'disabled:bg-cms-bg-disabled',
      'disabled:border-cms-border-base',
      'placeholder:text-cms-fg-muted',
      'disabled:placeholder:text-cms-fg-disabled',
      'text-compact-small font-base',
      className,
    )}
    ref={passedRef}
  />
);
