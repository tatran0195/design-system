import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { QueryProvider } from '@/app/providers/query-provider';
import { customDomainOrigin, siteHead } from '@/features/reader/links';
import { SiteRoute } from '@/features/reader/pages';
import { getSiteFn } from '@/features/reader/server';
export const Route = createFileRoute('/sites/$projectId')({
  component: ReaderRoute,
  // The active language lives in the URL so it survives reloads and is shareable.
  validateSearch: (search) => z.object({ lang: z.string().min(1).optional().catch(undefined) }).parse(search),
  loaderDeps: ({ search }) => ({ lang: search.lang }),
  // Fetch the site shell on the server so the chrome (nav, branding) is in the
  // initial HTML; the result also feeds site-level SEO tags via head(). The
  // first path segment is passed as a version candidate so versioned URLs
  // (`/sites/:id/v2/...`) SSR with that version's nav — the server ignores
  // candidates that aren't real version slugs.
  loader: async ({ params, deps, location }) => {
    try {
      const rest = location.pathname.replace(new RegExp(`^/sites/${params.projectId}/?`), '').replace(/\/+$/, '');
      const candidate = rest && rest !== 'changelog' ? decodeURIComponent(rest).split('/')[0] : undefined;
      const site = await getSiteFn({ data: { projectId: params.projectId, language: deps.lang, version: candidate } });
      return { site, siteOrigin: customDomainOrigin() };
    } catch {
      return { site: null, siteOrigin: customDomainOrigin() };
    }
  },
  head: ({ loaderData }) => siteHead(loaderData?.site ?? null, loaderData?.siteOrigin),
});

function ReaderRoute() {
  return (
    <QueryProvider>
      <SiteRoute />
    </QueryProvider>
  );
}
