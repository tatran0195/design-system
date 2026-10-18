import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { queryKeys } from '@/integrations/nibleaf/cache-keys';
import { deploymentSchema } from '@/integrations/nibleaf/contracts/responses/publishing';
import { api } from '@/integrations/nibleaf/endpoints';
import { mutateData } from '@/shared/api/response';
export const usePublish = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ message }: { message?: string }) =>
      mutateData(
        await api.app.projects[':projectId'].deployments.$post({
          param: { projectId },
          json: { ...(message ? { message } : {}) },
        }),
        'Could not publish.',
        z.lazy(() => deploymentSchema),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.deployments.all(projectId) });
      qc.invalidateQueries({ queryKey: queryKeys.deployments.latest(projectId) });
      qc.invalidateQueries({ queryKey: queryKeys.deployments.changes(projectId) });
    },
  });
};

export const usePublishAnyway = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      mutateData(
        await api.app.projects[':projectId'].deployments.$post({ param: { projectId }, json: { skipGrammarChecks: true } }),
        'Could not publish.',
        z.lazy(() => deploymentSchema),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.deployments.all(projectId) });
      qc.invalidateQueries({ queryKey: queryKeys.deployments.latest(projectId) });
      qc.invalidateQueries({ queryKey: queryKeys.deployments.changes(projectId) });
    },
  });
};

export const useRollback = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (deploymentId: string) =>
      mutateData(
        await api.app.projects[':projectId'].deployments[':id'].rollback.$post({ param: { projectId, id: deploymentId } }),
        'Could not roll back.',
        z.lazy(() => deploymentSchema),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.deployments.all(projectId) });
      qc.invalidateQueries({ queryKey: queryKeys.deployments.latest(projectId) });
      qc.invalidateQueries({ queryKey: queryKeys.deployments.changes(projectId) });
    },
  });
};
