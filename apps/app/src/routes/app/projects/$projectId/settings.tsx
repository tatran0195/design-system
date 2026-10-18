import { createFileRoute } from '@tanstack/react-router';
import { isSectionId, ProjectSettingsPage, type SectionId } from '@/features/project-settings/pages';
export const Route = createFileRoute('/app/projects/$projectId/settings')({
  component: ProjectSettingsPage,
  validateSearch: (search: Record<string, unknown>): { section: SectionId } => ({
    // Analytics moved under Integrations — keep old ?section=analytics links working.
    section: isSectionId(search.section) ? search.section : search.section === 'analytics' ? 'integrations' : 'general',
  }),
});
