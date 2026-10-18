import { createFileRoute } from '@tanstack/react-router';
import { SiteOverviewPage } from '@/features/projects/pages';
export const Route = createFileRoute('/app/projects/$projectId/')({
  component: SiteOverviewPage,
});
