import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { queryKeys } from '@/integrations/nibleaf/cache-keys';
import { domainSchema, openApiConfigurationSchema, projectAddonSchema } from '@/integrations/nibleaf/contracts/responses/settings';
import { api } from '@/integrations/nibleaf/endpoints';
import { requireQueryValue } from '@/shared/api/required-query';
import { getData } from '@/shared/api/response';

export const useProjectAddons = (projectId: string) =>
  useQuery({
    queryKey: queryKeys.addons.all(projectId),
    queryFn: async ({ signal }) =>
      getData(
        await api.app.projects[':projectId'].addons.$get({ param: { projectId } }, { init: { signal } }),
        'project add-ons',
        z.array(z.lazy(() => projectAddonSchema)),
      ),
  });

export const useDomains = (projectId: string | undefined) =>
  useQuery({
    queryKey: queryKeys.domains.all(projectId ?? ''),
    enabled: Boolean(projectId),
    queryFn: async ({ signal }) =>
      getData(
        await api.app.projects[':projectId'].domains.$get({ param: { projectId: requireQueryValue(projectId, 'Project ID') } }, { init: { signal } }),
        'domains',
        z.array(z.lazy(() => domainSchema)),
      ),
  });

export const useOpenApiConfiguration = (projectId: string | undefined) =>
  useQuery({
    queryKey: queryKeys.openapi.detail(projectId ?? ''),
    enabled: Boolean(projectId),
    queryFn: async ({ signal }) =>
      getData(
        await api.app.projects[':projectId'].openapi.$get({ param: { projectId: requireQueryValue(projectId, 'Project ID') } }, { init: { signal } }),
        'OpenAPI configuration',
        z.union([z.lazy(() => openApiConfigurationSchema), z.null()]),
      ),
  });
