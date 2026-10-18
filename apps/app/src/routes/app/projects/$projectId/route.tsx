import { createFileRoute, Outlet } from '@tanstack/react-router';
import { ProjectLayout } from '@/app/layouts/project';
import { ProjectAccessBoundary } from '@/features/membership';

export const Route = createFileRoute('/app/projects/$projectId')({
  component: ProjectRoute,
});

function ProjectRoute() {
  const { projectId } = Route.useParams();
  return (
    <ProjectAccessBoundary projectId={projectId}>
      <ProjectLayout projectId={projectId}>
        <Outlet />
      </ProjectLayout>
    </ProjectAccessBoundary>
  );
}
