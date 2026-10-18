import { createFileRoute } from '@tanstack/react-router';
import { SitesPage } from '@/features/projects/pages';
export const Route = createFileRoute('/app/(dashboard)/sites')({
  component: SitesPage,
  validateSearch: (search: Record<string, unknown>): { newSite?: boolean } =>
    search.newSite === true || search.newSite === 'true' ? { newSite: true } : {},
});
