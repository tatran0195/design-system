/**
 * Centralized query-key factory for TanStack Query.
 *
 * Using factory functions (rather than bare string arrays) ensures:
 * 1. TypeScript catches typos.
 * 2. Invalidation is always precise — `queryKeys.sites.all()` invalidates
 *    every key that starts with `["sites"]`.
 * 3. Keys are colocated and easy to document.
 *
 * Naming convention follows the TK-Dodo "Query Key Factory" pattern.
 */
export const queryKeys = {
  // ── Auth ────────────────────────────────────────────────────────────────
  auth: {
    all: () => ['auth'] as const,
    me: () => ['auth', 'me'] as const,
  },

  // ── Sites ────────────────────────────────────────────────────────────────
  sites: {
    all: () => ['sites'] as const,
    lists: () => ['sites', 'list'] as const,
    detail: (id: string) => ['sites', 'detail', id] as const,
  },

  // ── Docs ─────────────────────────────────────────────────────────────────
  docs: {
    all: () => ['docs'] as const,
    lists: (siteId: string) => ['docs', siteId, 'list'] as const,
    detail: (siteId: string, pageId: string) => ['docs', siteId, 'detail', pageId] as const,
    bySlug: (siteId: string, slug: string) => ['docs', siteId, 'slug', slug] as const,
  },

  // ── Notifications ────────────────────────────────────────────────────────
  notifications: {
    all: () => ['notifications'] as const,
    lists: (params?: { unread?: boolean; limit?: number }) => ['notifications', 'list', params ?? {}] as const,
    unreadCount: () => ['notifications', 'unread-count'] as const,
  },

  // ── Health ───────────────────────────────────────────────────────────────
  health: {
    all: () => ['health'] as const,
  },
} as const;
