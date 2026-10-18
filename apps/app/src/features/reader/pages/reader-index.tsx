import { getRouteApi } from '@tanstack/react-router';
import { SitePageView } from '@/features/reader';

const routeApi = getRouteApi('/sites/$projectId/');
export function SiteHome() {
  const { projectId } = routeApi.useParams();
  // Active language comes from the parent route's ?lang= search param.
  const { lang } = routeApi.useSearch();
  const { page } = routeApi.useLoaderData();
  // Empty path resolves to the first page server-side.
  return <SitePageView projectId={projectId} lang={lang} data={page} />;
}
