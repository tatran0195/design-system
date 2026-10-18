import { useMemo } from 'react';
import { type To, useLocation } from '../../../routing';
/** Optional helper; combines query/hash structurally and never stringifies a path object. */
export function useStateAwareTo(prev: To | number) {
  const location = useLocation();
  return useMemo(() => {
    if (typeof prev === 'number') return prev;
    const path =
      typeof prev === 'string'
        ? {
            pathname: prev.split(/[?#]/)[0],
            search: prev.includes('?') ? `?${prev.split('?')[1]?.split('#')[0]}` : '',
            hash: prev.includes('#') ? `#${prev.split('#')[1]}` : '',
          }
        : prev;
    const state = location.state as { restore_params?: string } | undefined;
    return { ...path, search: path.search || state?.restore_params || location.search };
  }, [prev, location]);
}
