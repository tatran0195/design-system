'use client';

import { Eye, EyeSlash, MagnifyingGlassMini } from '@cms/icons';
import { cva, type VariantProps } from 'cva';
import * as React from 'react';
import { clx } from '@/utils/clx';

const inputBaseStyles = clx(
  'caret-ui-fg-base bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-borders-base placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full appearance-none rounded-md outline-none',
  'focus-visible:shadow-borders-interactive-with-active',
  'disabled:text-ui-fg-disabled disabled:!bg-ui-bg-disabled disabled:placeholder-ui-fg-disabled disabled:cursor-not-allowed',
  'aria-[invalid=true]:!shadow-borders-error  invalid:!shadow-borders-error',
);

const inputVariants = cva({
  base: clx(
    inputBaseStyles,
    'ui-control-text',
    '[&::--webkit-search-cancel-button]:hidden [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden',
  ),
  variants: {
    size: {
      base: 'txt-compact-small h-8 px-2 py-0',
      small: 'txt-compact-small h-7 px-2 py-0',
    },
  },
  defaultVariants: {
    size: 'base',
  },
});

interface InputProps extends VariantProps<typeof inputVariants>, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Native HTML size, independent of the visual control size. */
  htmlSize?: number;
  /** Layout-only styling for the existing input/icon wrapper. */
  wrapperClassName?: string;
}

/**
 * This component is based on the `input` element and supports all of its props
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      wrapperClassName,
      htmlSize,
      type,
      /**
       * The input's size.
       */
      size = 'base',
      ...props
    }: InputProps,
    ref,
  ) => {
    const [passwordVisible, setPasswordVisible] = React.useState(false);

    const isPassword = type === 'password';
    const isSearch = type === 'search';
    React.useEffect(() => {
      if (!isPassword) setPasswordVisible(false);
    }, [isPassword]);

    return (
      <div className={clx('relative', wrapperClassName)}>
        <input
          ref={ref}
          size={htmlSize}
          type={isPassword && passwordVisible ? 'text' : type}
          className={clx(
            inputVariants({ size }),
            {
              'ps-8': isSearch && size === 'base',
              'pe-8': isPassword && size === 'base',
              'ps-7': isSearch && size === 'small',
              'pe-7': isPassword && size === 'small',
            },
            className,
          )}
          {...props}
        />
        {isSearch && (
          <div
            className={clx('text-ui-fg-muted pointer-events-none absolute bottom-0 start-0 flex items-center justify-center', {
              'h-8 w-8': size === 'base',
              'h-7 w-7': size === 'small',
            })}
            aria-hidden="true"
          >
            <MagnifyingGlassMini />
          </div>
        )}
        {isPassword && (
          <div
            className={clx('absolute bottom-0 end-0 flex items-center justify-center border-s', {
              'h-8 w-8': size === 'base',
              'h-7 w-7': size === 'small',
            })}
          >
            <button
              className="text-ui-fg-muted hover:text-ui-fg-base focus-visible:text-ui-fg-base focus-visible:shadow-borders-interactive-with-focus active:text-ui-fg-base h-fit w-fit rounded-sm outline-none transition-all"
              type="button"
              disabled={props.disabled}
              aria-pressed={passwordVisible}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setPasswordVisible((visible) => !visible);
              }}
            >
              <span className="sr-only">{passwordVisible ? 'Hide password' : 'Show password'}</span>
              {passwordVisible ? <EyeSlash /> : <Eye />}
            </button>
          </div>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input, inputBaseStyles };
