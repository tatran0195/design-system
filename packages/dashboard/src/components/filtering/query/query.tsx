'use client';
import { Input } from '@cms/ui';
import { useEffect, useRef, useState } from 'react';
import { useDebouncedValue } from '../../../hooks/use-debounced-value';
export interface QueryProps {
  value?: string;
  defaultValue?: string;
  /** Immediate value notification: use this to update a controlled input. */
  onChange?: (value: string) => void;
  /** Optional debounced search notification. Not fired for the initial value. */
  onSearch?: (value: string) => void;
  placeholder?: string;
  label?: string;
  debounceMs?: number;
  disabled?: boolean;
}
export function Query(props: QueryProps) {
  const { value, defaultValue = '', onChange, onSearch, placeholder = 'Search…', label = 'Search', debounceMs = 300, disabled } = props;
  const [internal, setInternal] = useState(defaultValue);
  const controlled = Object.hasOwn(props, 'value');
  const current = controlled ? (value ?? '') : internal;
  const debounced = useDebouncedValue(current, debounceMs);
  const previous = useRef(debounced);
  const search = useRef(onSearch);
  search.current = onSearch;
  useEffect(() => {
    if (previous.current !== debounced) {
      previous.current = debounced;
      search.current?.(debounced);
    }
  }, [debounced]);
  return (
    <Input
      type="search"
      size="small"
      value={current}
      aria-label={label}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(event) => {
        const next = event.target.value;
        if (!controlled) setInternal(next);
        onChange?.(next);
      }}
    />
  );
}
