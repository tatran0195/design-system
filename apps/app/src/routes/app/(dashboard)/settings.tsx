import { createFileRoute } from '@tanstack/react-router';
import { isTabValue, type TabValue, WorkspaceSettingsPage } from '@/features/account/pages';
export const Route = createFileRoute('/app/(dashboard)/settings')({
  component: WorkspaceSettingsPage,
  validateSearch: (search: Record<string, unknown>): { tab: TabValue } => ({
    tab: isTabValue(search.tab) ? search.tab : 'account',
  }),
});
