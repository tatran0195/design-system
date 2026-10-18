import { useEffect } from 'react';
/** Opt-in and restores the previous title when the host unmounts the shell. */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    if (title === undefined || typeof document === 'undefined') return;
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
