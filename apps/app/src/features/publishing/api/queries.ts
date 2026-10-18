import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { queryKeys } from '@/integrations/nibleaf/cache-keys';
import { pendingChangesSchema } from '@/integrations/nibleaf/contracts/responses/metadata';
import { deploymentSchema } from '@/integrations/nibleaf/contracts/responses/publishing';
import { api } from '@/integrations/nibleaf/endpoints';
import { requireQueryValue } from '@/shared/api/required-query';
import { getData } from '@/shared/api/response';

const isInFlight = (status?: string): boolean => status === 'PENDING' || status === 'BUILDING';

export const useDeployments = (projectId: string | undefined, options?: { enabled?: boolean; pollIntervalMs?: number }) =>
  useQuery({
    queryKey: queryKeys.deployments.all(projectId ?? ''),
    enabled: Boolean(projectId) && (options?.enabled ?? true),
    queryFn: async ({ signal }) =>
      getData(
        await api.app.projects[':projectId'].deployments.$get(
          { param: { projectId: requireQueryValue(projectId, 'Project ID') } },
          { init: { signal } },
        ),
        'deployments',
        z.array(z.lazy(() => deploymentSchema)),
      ),
    refetchInterval: (query) => (query.state.data?.some((d) => isInFlight(d.status)) ? (options?.pollIntervalMs ?? 2500) : false),
  });

export const usePendingChanges = (projectId: string | undefined, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: queryKeys.deployments.changes(projectId ?? ''),
    enabled: Boolean(projectId) && (options?.enabled ?? true),
    staleTime: 0,
    queryFn: async ({ signal }) =>
      getData(
        await api.app.projects[':projectId'].deployments.changes.$get(
          { param: { projectId: requireQueryValue(projectId, 'Project ID') } },
          { init: { signal } },
        ),
        'changes',
        z.lazy(() => pendingChangesSchema),
      ),
  });
