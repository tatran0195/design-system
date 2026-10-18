import { useRouterState } from '@tanstack/react-router';
import { type ReactNode, useEffect } from 'react';
import { authDocumentTitle } from '@/features/auth/model/auth-document-title';
import { useT } from '@/shared/i18n/react';
import { LocalizedProductProviders } from '@/shared/ui/localized-product-providers';

function AuthDocumentTitle() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const t = useT();

  useEffect(() => {
    const title = authDocumentTitle(pathname, t);
    if (title) document.title = title;
  }, [pathname, t]);

  return null;
}

/** Auth/common namespace only; editor, analytics, and admin copy remain in the
 * authenticated application chunk. */
export function AuthProviders({ children }: { children: ReactNode }) {
  return (
    <LocalizedProductProviders>
      <AuthDocumentTitle />
      {children}
    </LocalizedProductProviders>
  );
}
