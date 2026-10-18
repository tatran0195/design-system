import { useNavigate } from '@tanstack/react-router';
import { Check, ChevronsUpDown, LayoutGrid, Plus } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { useProjects } from '@/entities/project/api';
import { useT } from '@/shared/i18n/react';
import { NibleafMark } from '@/shared/ui/brand';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/shared/ui/sidebar';

const subscribeToHydration = () => () => undefined;

export function SiteSwitcher({ projectId, compact = false }: { projectId?: string; compact?: boolean }) {
  const { data: projects } = useProjects();
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const selected = hydrated ? projects?.find((project) => project.id === projectId) : undefined;
  const navigate = useNavigate();
  const t = useT();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                className={`${compact ? 'h-8' : 'h-9'} gap-2 rounded-md border border-sidebar-border bg-background shadow-xs data-[popup-open]:bg-sidebar-accent data-[popup-open]:text-sidebar-accent-foreground`}
              />
            }
          >
            <span className="grid size-5 shrink-0 place-items-center">
              {selected ? <NibleafMark className="size-5" /> : <LayoutGrid className="size-4 text-muted-foreground" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium text-sm" dir="auto">
                {selected?.name ?? t('project.allSites')}
              </span>
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel>{t('project.allSites')}</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigate({ to: '/app' })}>
              <LayoutGrid className="size-4.5" />
              <span className="flex-1">{t('nav.workspace')}</span>
              {!projectId ? <Check className="size-4 text-primary" /> : null}
            </DropdownMenuItem>
            {(projects ?? []).length > 0 ? <DropdownMenuSeparator /> : null}
            {(projects ?? []).map((site) => (
              <DropdownMenuItem key={site.id} onClick={() => navigate({ to: '/app/projects/$projectId', params: { projectId: site.id } })}>
                <NibleafMark className="size-4.5" />
                <span className="flex-1 truncate" dir="auto">
                  {site.name}
                </span>
                {site.id === projectId ? <Check className="size-4 text-primary" /> : null}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: '/app/sites', search: { newSite: true } })}>
              <Plus className="size-4.5" /> {t('dashboard.newProject')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
