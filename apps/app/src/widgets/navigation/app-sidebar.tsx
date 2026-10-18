import { Link, useRouterState } from '@tanstack/react-router';
import { BarChart3, BookOpen, LayoutDashboard, type LucideIcon, Search, Settings, UsersRound } from 'lucide-react';
import type { MessageKey } from '@/shared/i18n';
import { useLocale } from '@/shared/i18n/react';
import { useSearchShortcutLabel } from '@/shared/lib/shortcut';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/shared/ui/sidebar';
import { SiteSwitcher } from '@/widgets/navigation/site-switcher';

// Account-level nav. Members live per-site now (each site's Settings → Members),
// so they're not here; Analytics stays as the cross-site global view.
const NAV = [
  { to: '/app', labelKey: 'nav.overview', icon: LayoutDashboard, exact: true },
  { to: '/app/sites', labelKey: 'nav.sites', icon: BookOpen, exact: false },
  { to: '/app/analytics', labelKey: 'nav.analytics', icon: BarChart3, exact: false },
  { to: '/app/settings', labelKey: 'nav.settings', icon: Settings, exact: false },
] as const satisfies ReadonlyArray<{ to: string; labelKey: MessageKey; icon: LucideIcon; exact: boolean }>;

const PROJECTS_NAV = [
  { to: '/app/sites', labelKey: 'nav.sites', icon: BookOpen, exact: false },
  { to: '/app/analytics', labelKey: 'nav.analytics', icon: BarChart3, exact: false },
  { to: '/app/members', labelKey: 'members.title', icon: UsersRound, exact: false },
  { to: '/app/settings', labelKey: 'nav.settings', icon: Settings, exact: false },
] as const satisfies ReadonlyArray<{ to: string; labelKey: MessageKey; icon: LucideIcon; exact: boolean }>;

export function AppSidebar({ projectsPage = false, onOpenSearch }: { projectsPage?: boolean; onOpenSearch?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { t } = useLocale();
  const { setOpenMobile } = useSidebar();
  const searchShortcut = useSearchShortcutLabel();
  const navigation = projectsPage ? PROJECTS_NAV : NAV;

  return (
    <>
      {!projectsPage ? <SiteSwitcher /> : null}
      {projectsPage && onOpenSearch ? (
        <button
          aria-label={t('dashboard.search.placeholder')}
          className="flex h-8 w-full items-center gap-2 rounded-md border border-sidebar-border bg-background px-2 text-muted-foreground text-xs outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring"
          onClick={onOpenSearch}
          type="button"
        >
          <Search className="size-3.5 shrink-0" />
          <span className="min-w-0 flex-1 truncate text-start">{t('dashboard.search.placeholder')}</span>
          <kbd className="shrink-0 rounded border border-sidebar-border px-1 py-0.5 font-mono text-[10px]" dir="ltr">
            {searchShortcut}
          </kbd>
        </button>
      ) : null}
      <nav aria-label={t('nav.account')}>
        <SidebarGroup className={projectsPage ? 'px-0 pt-2' : 'px-0 pt-4'}>
          {projectsPage ? null : <SidebarGroupLabel>{t('nav.account')}</SidebarGroupLabel>}
          <SidebarMenu>
            {navigation.map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              const label = t(item.labelKey);
              return (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    onClick={() => setOpenMobile(false)}
                    isActive={active}
                    render={<Link to={item.to} />}
                    size="default"
                    className="h-8 rounded-md text-sm"
                    tooltip={label}
                  >
                    <item.icon className="size-4 text-muted-foreground" />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </nav>
    </>
  );
}
