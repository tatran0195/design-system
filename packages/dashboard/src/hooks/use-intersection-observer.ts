import { useCallback, useEffect, useRef, useState } from 'react';
export function useIntersectionObserver<T extends Element>({
  onIntersect,
  enabled = true,
  root = null,
  threshold = 0,
  rootMargin = '0px',
}: {
  onIntersect: () => void;
  enabled?: boolean;
  root?: Element | null;
  threshold?: number;
  rootMargin?: string;
}) {
  const latest = useRef(onIntersect);
  latest.current = onIntersect;
  const [target, setTarget] = useState<T | null>(null);
  useEffect(() => {
    if (!enabled || !target || typeof IntersectionObserver === 'undefined') return;
    let active = true;
    const observer = new IntersectionObserver(
      (entries) => {
        if (active && entries.some((entry) => entry.isIntersecting)) latest.current();
      },
      { root, threshold, rootMargin },
    );
    observer.observe(target);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [target, enabled, root, threshold, rootMargin]);
  return useCallback((node: T | null) => setTarget(node), []);
}
