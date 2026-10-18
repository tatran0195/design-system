'use client';

import { clx, Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarProvider, SidebarTrigger, useSidebar } from '@cms/ui';
import type { ReactNode } from 'react';
import { useDocumentDirection } from '../../../hooks/use-document-direction';
import { useDocumentTitle } from '../../../hooks/use-document-title';
export interface ShellProps {
  children: ReactNode;
  sidebar?: ReactNode;
  sidebarHeader?: ReactNode;
  sidebarFooter?: ReactNode;
  header?: ReactNode;
  toolbar?: ReactNode;
  title?: string;
  className?: string;
  sidebarOpen?: boolean;
  defaultSidebarOpen?: boolean;
  onSidebarOpenChange?: (open: boolean) => void;
  navigationLabel?: string;
  mainId?: string;
}
function ShellNavigation({ children, label }: { children: ReactNode; label: string }) {
  const { setOpenMobile, isMobile } = useSidebar();
  return (
    <SidebarContent
      aria-label={label}
      className="p-3"
      onClick={(event) => {
        if (isMobile && (event.target as Element).closest('a[href]')) setOpenMobile(false);
      }}
    >
      {children}
    </SidebarContent>
  );
}
export function Shell({
  children,
  sidebar,
  sidebarHeader,
  sidebarFooter,
  header,
  toolbar,
  title,
  className,
  sidebarOpen,
  defaultSidebarOpen = true,
  onSidebarOpenChange,
  navigationLabel = 'Main navigation',
  mainId = 'dashboard-content',
}: ShellProps) {
  useDocumentTitle(title);
  const direction = useDocumentDirection() ?? 'ltr';
  return (
    <SidebarProvider
      dir={direction}
      open={sidebarOpen}
      defaultOpen={defaultSidebarOpen}
      onOpenChange={onSidebarOpenChange}
      className={clx('bg-ui-bg-subtle text-ui-fg-base min-h-svh', className)}
    >
      <a
        href={`#${mainId}`}
        className="bg-ui-bg-base text-ui-fg-base focus:shadow-borders-focus sr-only z-ui-skip-link rounded p-3 focus:not-sr-only focus:fixed"
      >
        Skip to content
      </a>
      <Sidebar side={direction === 'rtl' ? 'right' : 'left'} collapsible="offcanvas">
        <SidebarHeader className="border-ui-border-base min-h-16 justify-center border-b px-5">{sidebarHeader}</SidebarHeader>
        <ShellNavigation label={navigationLabel}>{sidebar}</ShellNavigation>
        <SidebarFooter className="border-ui-border-base border-t p-3">{sidebarFooter}</SidebarFooter>
      </Sidebar>
      <SidebarInset id={mainId} tabIndex={-1} className="min-w-0 outline-none">
        <header className="border-ui-border-base bg-ui-bg-base flex min-h-16 flex-wrap items-center gap-3 border-b px-4 sm:px-6">
          <SidebarTrigger aria-label="Toggle navigation" />
          {header}
          <div className="ms-auto flex items-center gap-2">{toolbar}</div>
        </header>
        <div className="min-w-0 flex-1 p-4 outline-none sm:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
export const DashboardShell = Shell;
