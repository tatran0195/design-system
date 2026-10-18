import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { analyticsQueryKeys } from '@/features/analytics/api/query-keys';
import { projectAnalyticsSchema, workspaceAnalyticsSchema } from '@/integrations/nibleaf/contracts/responses/analytics';
import type { AnalyticsRange } from '@/integrations/nibleaf/contracts/validators/analytics';
import { api } from '@/integrations/nibleaf/endpoints';
import { getData } from '@/shared/api/response';

const browserTimezoneFn = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

export const useProjectAnalytics = (projectId: string | undefined, range: AnalyticsRange, options?: { enabled?: boolean; timezone?: string }) => {
  const timezone = options?.timezone ?? browserTimezoneFn();
  return useQuery({
    queryKey: analyticsQueryKeys.project(projectId ?? '', range, timezone),
    enabled: Boolean(projectId) && (options?.enabled ?? true),
    queryFn: async ({ signal }) =>
      getData(
        await api.app.projects[':projectId'].analytics.$get(
          {
            param: { projectId: requireProjectId(projectId) },
            query: { range, timezone },
          },
          { init: { signal } },
        ),
        'analytics',
        z.lazy(() => projectAnalyticsSchema),
      ),
  });
};

export const useWorkspaceAnalytics = (range: AnalyticsRange, options?: { enabled?: boolean; timezone?: string }) => {
  const timezone = options?.timezone ?? browserTimezoneFn();
  return useQuery({
    queryKey: analyticsQueryKeys.workspace(range, timezone),
    enabled: options?.enabled ?? true,
    queryFn: async ({ signal }) =>
      getData(
        await api.app.workspace.analytics.$get({ query: { range, timezone } }, { init: { signal } }),
        'workspace analytics',
        z.lazy(() => workspaceAnalyticsSchema),
      ),
  });
};

function requireProjectId(value: string | undefined) {
  if (!value) throw new Error('Project ID is required');
  return value;
}
