import { Link, useRouterState } from '@tanstack/react-router';
import { Eye } from 'lucide-react';
import type { ReactNode } from 'react';
import { DashboardBrand, DashboardFrame } from '@/app/layouts/dashboard';
import { useProject } from '@/entities/project/api';
import { NotificationsPopover } from '@/features/notifications';
import { useT } from '@/shared/i18n/react';
import { Button } from '@/shared/ui/button';
import { ProjectSidebar } from '@/widgets/navigation/project-sidebar';

/** Top-bar status badge + Publish button. Publishing happens through the modal → pipeline flow.
 *  `initialPublishOpen` opens the publish modal on mount (deep link: editor?publish=true). */

/** The per-site shell: a left sidebar (switcher + sections + account) with a slim
 *  content header. Publishing lives ONLY in the editor (Mintlify-style); the
 *  dashboard header just offers a live-site preview. */
export function ProjectLayout({ projectId, children }: { projectId: string; children: ReactNode }) {
  const t = useT();
  const { data: project } = useProject(projectId);
  const previewEnabled = project ? project.config?.addons?.previewDeployments !== false : false;
  // The editor is a focused, full-screen workspace (Mintlify-style): it renders
  // its OWN chrome (top bar + page-tree sidebar) and hides the dashboard nav.
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname.endsWith('/editor')) {
    return <div className="h-screen overflow-hidden">{children}</div>;
  }

  return (
    <DashboardFrame
      navigationLabel={t('nav.site')}
      sidebar={<ProjectSidebar projectId={projectId} />}
      sidebarHeader={<DashboardBrand />}
      header={
        project?.name ? (
          <span className="truncate font-medium text-sm" dir="auto">
            {project.name}
          </span>
        ) : (
          <span className="h-4 w-28 animate-pulse rounded bg-muted" aria-hidden />
        )
      }
      toolbar={
        <>
          <NotificationsPopover />
          <Button
            nativeButton={false}
            render={
              previewEnabled ? (
                <Link aria-label={t('project.previewDraftAria')} params={{ projectId }} to="/app/projects/$projectId/preview" />
              ) : (
                <a aria-label={t('project.previewLiveAria')} href={`/sites/${projectId}`} rel="noreferrer" target="_blank" />
              )
            }
            size="sm"
            variant="outline"
          >
            <Eye className="size-3.5" /> {t('project.preview')}
          </Button>
        </>
      }
    >
      {children}
    </DashboardFrame>
  );
}
