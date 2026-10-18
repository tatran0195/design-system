import { Link, useRouterState } from '@tanstack/react-router';
import { BarChart3, LayoutDashboard, type LucideIcon, PenLine, Settings as SettingsIcon } from 'lucide-react';
import type { MessageKey } from '@/shared/i18n';
import { useLocale } from '@/shared/i18n/react';
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/shared/ui/sidebar';
import { SiteSwitcher } from '@/widgets/navigation/site-switcher';

type NavItem = { labelKey: MessageKey; to: string; icon: LucideIcon; isActive: boolean };

/** Per-site sidebar: site switcher, the site's sections, and the account footer. */
export function ProjectSidebar({ projectId }: { projectId: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { t } = useLocale();
  const { setOpenMobile } = useSidebar();

  const base = `/app/projects/${projectId}`;
  const nav: NavItem[] = [
    { labelKey: 'project.overview', to: '/app/projects/$projectId', icon: LayoutDashboard, isActive: pathname === base },
    { labelKey: 'project.editor', to: '/app/projects/$projectId/editor', icon: PenLine, isActive: pathname.startsWith(`${base}/editor`) },
    { labelKey: 'project.analytics', to: '/app/projects/$projectId/analytics', icon: BarChart3, isActive: pathname.startsWith(`${base}/analytics`) },
    { labelKey: 'project.settings', to: '/app/projects/$projectId/settings', icon: SettingsIcon, isActive: pathname.startsWith(`${base}/settings`) },
  ];

  return (
    <>
      <SiteSwitcher projectId={projectId} />
      <nav aria-label={t('nav.site')}>
        <SidebarGroup className="px-0 pt-4">
          <SidebarMenu>
            {nav.map((item) => (
              <SidebarMenuItem key={item.labelKey}>
                <SidebarMenuButton
                  onClick={() => setOpenMobile(false)}
                  isActive={item.isActive}
                  render={<Link params={{ projectId }} to={item.to} />}
                  size="default"
                  className="h-8 rounded-md text-sm"
                  tooltip={t(item.labelKey)}
                >
                  <item.icon className="size-4 text-muted-foreground" />
                  <span>{t(item.labelKey)}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </nav>
    </>
  );
}
