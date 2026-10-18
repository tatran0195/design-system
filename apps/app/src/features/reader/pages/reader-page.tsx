import { getRouteApi } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { SitePageView } from '@/features/reader';

const routeApi = getRouteApi('/sites/$projectId/$');
const OpenApiReferenceView = lazy(() =>
  import('@/features/reader/components/openapi-reference-view').then((module) => ({ default: module.OpenApiReferenceView })),
);

export function SitePath() {
  const { projectId } = routeApi.useParams();
  // Active language comes from the parent route's ?lang= search param.
  const { lang } = routeApi.useSearch();
  const data = routeApi.useLoaderData();
  if (data.kind === 'openapi') {
    return (
      <Suspense fallback={<div className="py-12 text-center text-muted-foreground">Loading API reference…</div>}>
        <OpenApiReferenceView projectId={projectId} />
      </Suspense>
    );
  }
  return <SitePageView projectId={projectId} lang={lang} data={data.page} />;
}
