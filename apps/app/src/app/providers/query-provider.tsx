import { IsRestoringProvider, QueryClient, type QueryClientConfig, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState, useSyncExternalStore } from 'react';

const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,
    },
  },
};

const subscribe = () => () => {};
const clientSnapshot = () => false;
const serverSnapshot = () => true;

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient(queryClientConfig));
  // Hold requests during the first hydrated render: a sidebar's fast query
  // must not populate the shared cache before a streamed route hydrates its
  // matching server-rendered loading placeholders.
  const restoring = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  return (
    <QueryClientProvider client={queryClient}>
      <IsRestoringProvider value={restoring}>{children}</IsRestoringProvider>
    </QueryClientProvider>
  );
}
