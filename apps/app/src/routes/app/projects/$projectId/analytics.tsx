import { createFileRoute } from '@tanstack/react-router';
import { ProjectAnalyticsRoute } from '@/features/analytics/pages';
export const Route = createFileRoute('/app/projects/$projectId/analytics')({
  component: ProjectAnalyticsRoute,
});
