import { createContext, type ReactNode, useContext } from 'react';
import type { CmsClient } from '../client.js';

// ─── Context ──────────────────────────────────────────────────────────────────

const CmsClientContext = createContext<CmsClient | null>(null);
CmsClientContext.displayName = 'CmsClientContext';

// ─── Provider ─────────────────────────────────────────────────────────────────

export interface CmsClientProviderProps {
  client: CmsClient;
  children: ReactNode;
}

/**
 * Provides a `CmsClient` instance to the entire subtree.
 *
 * ```tsx
 * const client = createCmsClient({ baseUrl: "/api", onUnauthenticated: () => navigate("/login") });
 *
 * <CmsClientProvider client={client}>
 *   <App />
 * </CmsClientProvider>
 * ```
 */
export function CmsClientProvider({ client, children }: CmsClientProviderProps): ReactNode {
  return <CmsClientContext.Provider value={client}>{children}</CmsClientContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Returns the nearest `CmsClient` from context.
 * Throws if used outside `<CmsClientProvider>`.
 */
export function useCmsClient(): CmsClient {
  const client = useContext(CmsClientContext);
  if (!client) {
    throw new Error('[CmsClient] useCmsClient() must be called inside <CmsClientProvider>.');
  }
  return client;
}
