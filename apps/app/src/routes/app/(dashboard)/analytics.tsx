import { createFileRoute } from '@tanstack/react-router';
import { WorkspaceAnalyticsRoute } from '@/features/analytics/pages';
export const Route = createFileRoute('/app/(dashboard)/analytics')({
  component: WorkspaceAnalyticsRoute,
});
