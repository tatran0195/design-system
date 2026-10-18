import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { requestNonce } from '@/app/bootstrap/ssr-nonce';
import { hydratedCustomDomainProjectId, rewriteCustomDomainInput, rewriteCustomDomainOutput } from '@/features/reader/links';
import { routeTree } from '@/routeTree.gen';
import { ErrorPage } from '@/shared/ui/error-page';
import { NotFound } from '@/shared/ui/not-found';
import { PageLoader } from '@/shared/ui/page-loader';

export function getRouter() {
  const customDomainProjectId = hydratedCustomDomainProjectId();
  const router = createTanStackRouter({
    routeTree,
    ssr: { nonce: requestNonce() },
    defaultNotFoundComponent: NotFound,
    defaultErrorComponent: ErrorPage,
    // Branded loading screen for route transitions that resolve loaders/data.
    // The delay avoids a flash on fast navigations; the min duration prevents a
    // jarring flicker once it does show.
    defaultPendingComponent: PageLoader,
    defaultPendingMs: 200,
    defaultPendingMinMs: 400,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    rewrite: customDomainProjectId
      ? {
          input: ({ url }) => rewriteCustomDomainInput(url, customDomainProjectId),
          output: ({ url }) => rewriteCustomDomainOutput(url, customDomainProjectId),
        }
      : undefined,
  });
  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
