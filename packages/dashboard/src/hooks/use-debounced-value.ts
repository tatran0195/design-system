import { useEffect, useState } from 'react';
export function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), Math.max(0, delay));
    return () => clearTimeout(timer);
  }, [value, delay]);
  return delay <= 0 ? value : debounced;
}
