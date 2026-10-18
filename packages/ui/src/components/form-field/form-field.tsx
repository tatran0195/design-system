import type { ComponentProps } from 'react';
import { clx } from '@/utils/clx';

export type FieldErrorProps = Omit<ComponentProps<'p'>, 'children'> & { errors: readonly unknown[] };

/** Inline validation messages; accepts string and schema-issue errors. */
export function FieldError({ errors, className, ...props }: FieldErrorProps) {
  const messages = [
    ...new Set(
      errors
        .map((error) => {
          if (typeof error === 'string') return error.trim();
          if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') return error.message.trim();
          return '';
        })
        .filter(Boolean),
    ),
  ];
  if (messages.length === 0) return null;
  return (
    <p role="alert" className={clx('txt-compact-xsmall text-ui-fg-error', className)} {...props}>
      {messages.join(', ')}
    </p>
  );
}
