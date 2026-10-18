import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { queryKeys } from '@/integrations/nibleaf/cache-keys';
import { integrationCatalogEntrySchema, integrationConnectionSummarySchema } from '@/integrations/nibleaf/contracts/responses/integrations';
import type { IntegrationProviderId } from '@/integrations/nibleaf/contracts/shared/integrations';
import type {
  CreateProjectIntegrationBody,
  IntegrationRevisionBody,
  UpdateProjectIntegrationBody,
  VerifyProjectIntegrationBody,
} from '@/integrations/nibleaf/contracts/validators/integrations';
import { configurableIntegrationProviderIdSchema } from '@/integrations/nibleaf/contracts/validators/integrations';
import { api } from '@/integrations/nibleaf/endpoints';
import { ApiResponseError, getData, mutateData } from '@/shared/api/response';
import { useT } from '@/shared/i18n/react';

type ConfigurableProviderId = 'slack' | 'discord' | 'zapier';

export const useProjectIntegrations = (projectId: string) => {
  const t = useT();
  return useQuery({
    enabled: Boolean(projectId),
    queryKey: queryKeys.integrations.all(projectId),
    queryFn: async ({ signal }) =>
      getData(
        await api.app.projects[':projectId'].integrations.$get({ param: { projectId } }, { init: { signal } }),
        'integrations',
        z.array(z.lazy(() => integrationCatalogEntrySchema)),
        t('settings.integrations.actionError'),
      ),
  });
};

const useIntegrationMutation = <TVariables, TResult>(projectId: string, mutationFn: (variables: TVariables) => Promise<TResult>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.integrations.all(projectId) }),
    onError: async (error) => {
      if (error instanceof ApiResponseError && error.code === 'integration:revision_conflict') {
        await queryClient.invalidateQueries({ queryKey: queryKeys.integrations.all(projectId), exact: true, refetchType: 'all' });
      }
    },
  });
};

export const useCreateProjectIntegration = (projectId: string) => {
  const t = useT();
  return useIntegrationMutation(projectId, async (json: CreateProjectIntegrationBody) =>
    mutateData(
      await api.app.projects[':projectId'].integrations.$post({ param: { projectId }, json }),
      t('settings.integrations.actionError'),
      z.lazy(() => integrationConnectionSummarySchema),
    ),
  );
};

export const useUpdateProjectIntegration = (projectId: string) => {
  const t = useT();
  return useIntegrationMutation(projectId, async ({ providerId, body }: { providerId: ConfigurableProviderId; body: UpdateProjectIntegrationBody }) =>
    mutateData(
      await api.app.projects[':projectId'].integrations[':providerId'].$patch({ param: { projectId, providerId }, json: body }),
      t('settings.integrations.actionError'),
      z.lazy(() => integrationConnectionSummarySchema),
    ),
  );
};

const useStatusProjectIntegration = (projectId: string, action: 'activate' | 'deactivate') => {
  const t = useT();
  return useIntegrationMutation(projectId, async ({ providerId, body }: { providerId: ConfigurableProviderId; body: IntegrationRevisionBody }) => {
    const route = api.app.projects[':projectId'].integrations[':providerId'][action];
    return mutateData(
      await route.$post({ param: { projectId, providerId }, json: body }),
      t('settings.integrations.actionError'),
      z.lazy(() => integrationConnectionSummarySchema),
    );
  });
};

export const useActivateProjectIntegration = (projectId: string) => useStatusProjectIntegration(projectId, 'activate');
export const useDeactivateProjectIntegration = (projectId: string) => useStatusProjectIntegration(projectId, 'deactivate');

export const useVerifyProjectIntegration = (projectId: string) => {
  const t = useT();
  return useIntegrationMutation(projectId, async ({ providerId, body }: { providerId: IntegrationProviderId; body: VerifyProjectIntegrationBody }) =>
    mutateData(
      await api.app.projects[':projectId'].integrations[':providerId'].verify.$post({ param: { projectId, providerId }, json: body }),
      t('settings.integrations.actionError'),
      z.union([z.lazy(() => integrationCatalogEntrySchema), z.lazy(() => integrationConnectionSummarySchema)]),
    ),
  );
};

export const useDeleteProjectIntegration = (projectId: string) => {
  const t = useT();
  return useIntegrationMutation(
    projectId,
    async ({ providerId, expectedRevision }: { providerId: ConfigurableProviderId; expectedRevision: number }) => {
      const confirmation = await mutateData(
        await api.app.projects[':projectId'].integrations[':providerId']['delete-confirmation'].$post({
          param: { projectId, providerId },
          json: { expectedRevision },
        }),
        t('settings.integrations.actionError'),
        z.object({ confirmationToken: z.string() }),
      );
      return mutateData(
        await api.app.projects[':projectId'].integrations[':providerId'].$delete({
          param: { projectId, providerId },
          json: { confirmationToken: confirmation.confirmationToken },
        }),
        t('settings.integrations.actionError'),
        z.object({ providerId: configurableIntegrationProviderIdSchema, deleted: z.literal(true) }),
      );
    },
  );
};
