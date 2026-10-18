import { Shell } from '@cms/dashboard';
import { useRouterState } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { type ComponentProps, type ReactNode, useState } from 'react';
import { NotificationsPopover } from '@/features/notifications';
import type { MessageKey } from '@/shared/i18n';
import { useLocale, useT } from '@/shared/i18n/react';
import { useSearchShortcutLabel } from '@/shared/lib/shortcut';
import { NibleafMark, NibleafWordmark } from '@/shared/ui/brand';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/shared/ui/breadcrumb';
import { SidebarTrigger, useSidebar } from '@/shared/ui/sidebar';
import { AppSidebar } from '@/widgets/navigation/app-sidebar';
import { CommandPalette } from '@/widgets/navigation/command-palette';
import { SidebarAccountFooter } from '@/widgets/navigation/sidebar-account-footer';
import { SiteSwitcher } from '@/widgets/navigation/site-switcher';

function NavigationToggle() {
  const { locale, t } = useLocale();
  const { isMobile, openMobile, open } = useSidebar();
  const expanded = isMobile ? openMobile : open;
  const label = locale === 'en' ? undefined : t(expanded ? 'editor.hideSidebar' : 'editor.showSidebar');
  return <SidebarTrigger aria-label={label} title={label ?? 'Toggle Sidebar'} />;
}

export function DashboardFrame({
  header,
  projectsPage = false,
  ...props
}: Pick<ComponentProps<typeof Shell>, 'children' | 'sidebar' | 'sidebarHeader' | 'header' | 'toolbar' | 'navigationLabel'> & {
  projectsPage?: boolean;
}) {
  return (
    <Shell
      {...props}
      sidebarFooter={<SidebarAccountFooter />}
      header={
        <div className={`flex min-w-0 items-center gap-3 ${projectsPage ? 'lg:invisible' : ''}`}>
          <NavigationToggle />
          {header}
        </div>
      }
      className={`${projectsPage ? '[--sidebar-width:11.75rem!important] lg:[&>[data-slot=sidebar-inset]>header]:border-transparent lg:[&_[data-slot=sidebar-gap]]:!w-[188px] lg:[&_[data-slot=sidebar-container]]:!w-[188px]' : '[--sidebar-width:16rem]'} [&>[data-slot=sidebar-inset]>header]:sticky [&>[data-slot=sidebar-inset]>header]:top-0 [&>[data-slot=sidebar-inset]>header]:z-20 [&>[data-slot=sidebar-inset]>header]:h-14 [&>[data-slot=sidebar-inset]>header]:min-h-14 [&>[data-slot=sidebar-inset]>header]:flex-nowrap [&>[data-slot=sidebar-inset]>header>[data-slot=sidebar-trigger]]:hidden [&>[data-slot=sidebar-inset]>div]:p-0 [&_[data-slot=sidebar-header]]:min-h-14 [&_[data-slot=sidebar-header]]:px-3 [&_[data-slot=sidebar-content]]:p-3`}
    />
  );
}

export function DashboardBrand() {
  return (
    <div className="flex h-8 items-center gap-2 px-2">
      <NibleafMark className="size-6" />
      <NibleafWordmark />
    </div>
  );
}

/** Derive the header title key from the current dashboard route. */
function titleKeyFromPathname(pathname: string): MessageKey {
  if (pathname.startsWith('/app/members')) {
    return 'dashboard.header.members';
  }
  if (pathname.startsWith('/app/settings')) {
    return 'dashboard.header.settings';
  }
  if (pathname.startsWith('/app/analytics')) return 'nav.analytics';
  if (pathname.startsWith('/app/sites')) return 'nav.sites';
  if (pathname === '/app' || pathname === '/app/') return 'nav.overview';
  return 'dashboard.header.projects';
}

/** The signed-in workspace shell: sidebar + top bar + command palette. */
export function DashboardLayout({ children }: { children: ReactNode }) {
  const t = useT();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const title = t(titleKeyFromPathname(pathname));
  const projectsPage = pathname === '/app/sites';
  const [paletteOpen, setPaletteOpen] = useState(false);
  const searchShortcut = useSearchShortcutLabel();

  return (
    <>
      <DashboardFrame
        navigationLabel={t('nav.account')}
        projectsPage={projectsPage}
        sidebar={<AppSidebar projectsPage={projectsPage} onOpenSearch={() => setPaletteOpen(true)} />}
        sidebarHeader={projectsPage ? <SiteSwitcher compact /> : <DashboardBrand />}
        header={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
        toolbar={
          <div className={`flex items-center gap-2 ${projectsPage ? 'lg:hidden' : ''}`}>
            {projectsPage ? null : (
              <button
                aria-label={t('dashboard.search.placeholder')}
                className="flex h-8 w-8 items-center justify-center gap-2 rounded-md border border-input bg-background px-2 text-muted-foreground text-sm shadow-xs outline-none transition-colors hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-56 sm:justify-start sm:px-3"
                onClick={() => setPaletteOpen(true)}
                type="button"
              >
                <Search className="size-3.5" />
                <span className="hidden flex-1 text-start sm:block">{t('dashboard.search.placeholder')}</span>
                <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] sm:block" dir="ltr">
                  {searchShortcut}
                </kbd>
              </button>
            )}
            <NotificationsPopover />
          </div>
        }
      >
        <div className="min-w-0 p-3">{children}</div>
      </DashboardFrame>
      <CommandPalette onOpenChange={setPaletteOpen} open={paletteOpen} />
    </>
  );
}
