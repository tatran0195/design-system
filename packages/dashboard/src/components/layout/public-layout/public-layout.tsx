'use client';
import { clx } from '@cms/ui';
import type { ReactNode } from 'react';
import { useDocumentTitle } from '../../../hooks/use-document-title';
export interface PublicLayoutProps {
  children: ReactNode;
  brand?: ReactNode;
  footer?: ReactNode;
  aside?: ReactNode;
  title?: string;
  className?: string;
}
export function PublicLayout({ children, brand, footer, aside, title, className }: PublicLayoutProps) {
  useDocumentTitle(title);
  return (
    <main className={clx('bg-ui-bg-subtle text-ui-fg-base grid min-h-svh lg:grid-cols-[1fr_auto]', className)}>
      <div className="flex min-w-0 flex-col items-center justify-center gap-8 px-4 py-12">
        {brand}
        <div className="bg-ui-bg-base shadow-elevation-card-rest w-full max-w-md rounded-xl p-6 sm:p-8">{children}</div>
        {footer}
      </div>
      {aside && <aside className="hidden max-w-xl lg:block">{aside}</aside>}
    </main>
  );
}
export const AuthShell = PublicLayout;
