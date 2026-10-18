import { XMarkMini } from '@cms/icons';
import { Badge, clx } from '@cms/ui';
import { motion } from 'motion/react';
import { forwardRef, type InputHTMLAttributes, useEffect, useRef, useState } from 'react';
import { useCombinedRefs } from '../../../hooks/use-combined-refs';
export type ChipInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange'> & {
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  allowDuplicates?: boolean;
  showRemove?: boolean;
  variant?: 'base' | 'contrast';
};
export const ChipInput = forwardRef<HTMLInputElement, ChipInputProps>(function ChipInput(props, forwardedRef) {
  const {
    value,
    defaultValue = [],
    onChange,
    onBlur,
    onKeyDown,
    disabled,
    showRemove = true,
    variant = 'base',
    allowDuplicates = false,
    placeholder,
    className,
    ...inputProps
  } = props;
  const controlled = Object.hasOwn(props, 'value');
  const [internal, setInternal] = useState(() => [...defaultValue]);
  const chips = controlled ? (value ?? []) : internal;
  const input = useRef<HTMLInputElement>(null);
  const ref = useCombinedRefs(input, forwardedRef);
  const [duplicate, setDuplicate] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const change = (next: string[]) => {
    if (disabled) return;
    if (!controlled) setInternal(next);
    onChange?.(next);
  };
  const add = (text: string) => {
    if (disabled || !text.trim()) return;
    const clean = text.trim();
    if (!allowDuplicates && chips.includes(clean)) {
      clearTimeout(timer.current);
      setDuplicate(chips.indexOf(clean));
      timer.current = setTimeout(() => setDuplicate(null), 300);
      return;
    }
    change([...chips, clean]);
  };
  const remove = (index: number) => change(chips.filter((_, current) => current !== index));
  return (
    <div
      className={clx(
        'shadow-borders-base transition-fg focus-within:shadow-borders-interactive-with-active flex min-h-8 flex-wrap items-center gap-1 rounded-md px-2 py-1.5 has-[input:disabled]:cursor-not-allowed has-[input:disabled]:bg-ui-bg-disabled has-[input:disabled]:text-ui-fg-disabled',
        variant === 'contrast' ? 'bg-ui-bg-field-component hover:bg-ui-bg-field-component-hover' : 'bg-ui-bg-field hover:bg-ui-bg-field-hover',
        className,
      )}
      onClick={() => {
        if (!disabled) input.current?.focus();
      }}
    >
      {chips.map((chip, index) => (
        <Badge key={`${chip}-${index}`} size="2xsmall" className="max-w-full min-w-0 overflow-hidden px-1.5" asChild>
          <motion.div animate={duplicate === index ? { x: [0, -2, 2, -2, 2, 0] } : undefined}>
            <span className="min-w-0 truncate">{chip}</span>
            {showRemove && (
              <button
                type="button"
                aria-label={`Remove ${chip}`}
                disabled={disabled}
                tabIndex={-1}
                onClick={(event) => {
                  event.stopPropagation();
                  remove(index);
                }}
                className="text-ui-fg-subtle transition-fg ms-1 shrink-0 rounded outline-none disabled:cursor-not-allowed"
              >
                <XMarkMini />
              </button>
            )}
          </motion.div>
        </Badge>
      ))}
      <input
        {...inputProps}
        ref={ref}
        disabled={disabled}
        placeholder={chips.length ? undefined : placeholder}
        autoComplete="off"
        className="text-ui-fg-base caret-ui-fg-base txt-compact-small placeholder:text-ui-fg-muted min-w-0 flex-1 appearance-none bg-transparent focus:outline-none disabled:cursor-not-allowed disabled:text-ui-fg-disabled"
        onBlur={(event) => {
          onBlur?.(event);
          if (!event.defaultPrevented && event.target.value) {
            add(event.target.value);
            event.target.value = '';
          }
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (disabled || event.defaultPrevented || event.nativeEvent.isComposing || event.keyCode === 229) return;
          if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            add(event.currentTarget.value);
            event.currentTarget.value = '';
          } else if (event.key === 'Backspace' && !event.currentTarget.value && chips.length) remove(chips.length - 1);
        }}
      />
    </div>
  );
});
