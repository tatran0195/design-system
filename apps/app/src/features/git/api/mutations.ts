import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { queryKeys } from '@/integrations/nibleaf/cache-keys';
import { api } from '@/integrations/nibleaf/endpoints';
import { acknowledgementSchema, mutateData } from '@/shared/api/response';

export const useImportFromGit = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      mutateData(
        await api.app.projects[':projectId'].settings.git.import.$post({ param: { projectId } }),
        'Could not import from Git.',
        z.object({ imported: z.number(), updated: z.number() }),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.workspace.projectSettings(projectId) });
      qc.invalidateQueries({ queryKey: ['pages', projectId] });
    },
  });
};

export const useRotateGitWebhookSecret = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      mutateData(
        await api.app.projects[':projectId'].settings.git['webhook-secret'].$post({ param: { projectId } }),
        'Could not rotate the webhook secret.',
        acknowledgementSchema,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.workspace.projectSettings(projectId) }),
  });
};
