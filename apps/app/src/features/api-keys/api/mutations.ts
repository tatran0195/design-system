import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { queryKeys } from '@/integrations/nibleaf/cache-keys';
import { apiKeySchema, apiKeySecretSchema } from '@/integrations/nibleaf/contracts/responses/api-keys';
import type { CreateApiKeyBody, RotateApiKeyBody } from '@/integrations/nibleaf/contracts/validators/api-keys';
import { api } from '@/integrations/nibleaf/endpoints';
import { mutateData } from '@/shared/api/response';
import { useT } from '@/shared/i18n/react';

export const useCreateApiKey = (projectId: string) => {
  const queryClient = useQueryClient();
  const t = useT();
  return useMutation({
    mutationFn: async (body: CreateApiKeyBody) =>
      mutateData(
        await api.app.projects[':projectId']['api-keys'].$post({ param: { projectId }, json: body }),
        t('settings.apiKeys.createError'),
        z.lazy(() => apiKeySecretSchema),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all(projectId) }),
  });
};

export const useRotateApiKey = (projectId: string) => {
  const queryClient = useQueryClient();
  const t = useT();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: RotateApiKeyBody }) =>
      mutateData(
        await api.app.projects[':projectId']['api-keys'][':id'].rotate.$post({ param: { projectId, id }, json: body }),
        t('settings.apiKeys.rotateError'),
        z.lazy(() => apiKeySecretSchema),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all(projectId) }),
  });
};

export const useRevokeApiKey = (projectId: string) => {
  const queryClient = useQueryClient();
  const t = useT();
  return useMutation({
    mutationFn: async (id: string) =>
      mutateData(
        await api.app.projects[':projectId']['api-keys'][':id'].$delete({ param: { projectId, id } }),
        t('settings.apiKeys.revokeError'),
        z.lazy(() => apiKeySchema),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all(projectId) }),
  });
};
