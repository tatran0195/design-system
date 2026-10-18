import { createFileRoute } from '@tanstack/react-router';
import { ProjectsPage } from '@/features/projects/pages';
export const Route = createFileRoute('/app/(dashboard)/')({
  component: ProjectsPage,
  validateSearch: (search: Record<string, unknown>): { firstPublish?: boolean; newSite?: boolean } => ({
    ...(search.firstPublish === true || search.firstPublish === 'true' ? { firstPublish: true } : {}),
    ...(search.newSite === true || search.newSite === 'true' ? { newSite: true } : {}),
  }),
});
