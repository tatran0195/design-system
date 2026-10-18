import { createFileRoute, Navigate, Outlet, redirect } from '@tanstack/react-router';
import { AppProviders } from '@/app/providers/product';
import { QueryProvider } from '@/app/providers/query-provider';
import { ProjectProvider } from '@/entities/project';
import { SupportAccessBanner } from '@/features/auth';
import { useSession } from '@/features/auth/api';
import { getSessionFn } from '@/features/auth/server';
import { PageLoader } from '@/shared/ui/page-loader';

export const Route = createFileRoute('/app')({
  beforeLoad: async () => {
    const routeSession = await getSessionFn();
    if (!routeSession) {
      throw redirect({ to: '/sign-in' });
    }
    return { routeSession };
  },
  head: () => ({
    meta: [{ name: 'robots', content: 'noindex' }],
  }),
  component: AppRoute,
});

/** Forward guard: signed-out users go to sign-in; the rest get the app. */
function AppRoute() {
  return (
    <QueryProvider>
      <AppProviders>
        <AppGuard />
      </AppProviders>
    </QueryProvider>
  );
}

function AppGuard() {
  const { routeSession } = Route.useRouteContext();
  const { data: session, isPending, isRefetching } = useSession();
  // A verified route session bridges only an in-flight client refresh.
  // Once refresh completes with null, the normal signed-out redirect wins.
  const resolvedSession = session ?? (isPending || isRefetching ? routeSession : null);

  if (isPending && !resolvedSession) {
    return <PageLoader />;
  }
  if (!resolvedSession) return <Navigate to="/sign-in" />;
  const supportSession = resolvedSession as {
    session?: { impersonatedBy?: string | null };
    user?: { id?: string | null; name?: string | null; email?: string | null };
  };
  const impersonatedBy = supportSession.session?.impersonatedBy;
  return (
    <div className={impersonatedBy ? 'pb-14' : undefined}>
      <ProjectProvider>
        <Outlet />
      </ProjectProvider>
      {impersonatedBy && supportSession.user?.id ? (
        <SupportAccessBanner customerId={supportSession.user.id} customerName={supportSession.user.name || supportSession.user.email} />
      ) : null}
    </div>
  );
}
