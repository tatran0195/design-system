import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { customDomainOrigin, isCustomDomainSite, pageHead, redirectIfConfigured } from '@/features/reader/links';
import { SiteHome } from '@/features/reader/pages';
import { getSiteFn, getSitePageFn } from '@/features/reader/server';
import { ApiResponseError } from '@/shared/api/response';
export const Route = createFileRoute('/sites/$projectId/')({
  component: SiteHome,
  loaderDeps: ({ search }) => ({ lang: search.lang }),
  // Empty path resolves to the site's first page server-side (content + SEO).
  loader: async ({ params, deps }) => {
    try {
      const page = await getSitePageFn({ data: { projectId: params.projectId, path: '', language: deps.lang } });
      return { page, lang: deps.lang, siteOrigin: customDomainOrigin() };
    } catch (error) {
      if (!(error instanceof ApiResponseError) || error.status !== 404) {
        throw error;
      }
      // A site may intentionally publish only an API reference. Give that
      // reference a useful home URL instead of returning a root 404.
      const site = await getSiteFn({ data: { projectId: params.projectId, language: deps.lang } }).catch(() => null);
      if (site?.openapi) {
        const prefix = isCustomDomainSite(params.projectId) ? '' : `/sites/${params.projectId}`;
        const query = deps.lang ? `?lang=${encodeURIComponent(deps.lang)}` : '';
        throw redirect({ href: `${prefix}/${site.openapi.path}${query}`, statusCode: 302 });
      }
      // Honor a configured redirect for the site root before the not-found
      // state. Mark the SSR response 404 so this soft-404 returns the right
      // status (the head also carries robots noindex).
      await redirectIfConfigured(params.projectId, '', deps.lang);
      // Throw the router's not-found sentinel so TanStack owns the final HTTP
      // status. Mutating the response from inside this streamed loader produced
      // a soft 200 in production.
      throw notFound();
    }
  },
  head: ({ loaderData, params }) => pageHead(loaderData?.page ?? null, params.projectId, loaderData?.lang, loaderData?.siteOrigin),
});
