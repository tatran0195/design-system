'use client';
import { type FormHTMLAttributes, forwardRef } from 'react';
export interface KeyboundFormProps extends FormHTMLAttributes<HTMLFormElement> {
  preventImplicitSubmit?: boolean;
}
/** Explicit submit buttons still work; Ctrl/Cmd+Enter requests a validated native submit. */
export const KeyboundForm = forwardRef<HTMLFormElement, KeyboundFormProps>(function KeyboundForm(
  { onSubmit, onKeyDown, preventImplicitSubmit = true, ...props },
  ref,
) {
  return (
    <form
      {...props}
      ref={ref}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.(event);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || event.nativeEvent.isComposing || event.key !== 'Enter') return;
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault();
          event.currentTarget.requestSubmit();
          return;
        }
        const target = event.target instanceof Element ? event.target : null;
        if (preventImplicitSubmit && target?.matches('input:not([type="submit"]):not([type="button"])')) event.preventDefault();
      }}
    />
  );
});
