import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { queryKeys } from '@/integrations/nibleaf/cache-keys';
import { apiKeySchema } from '@/integrations/nibleaf/contracts/responses/api-keys';
import { api } from '@/integrations/nibleaf/endpoints';
import { requireQueryValue } from '@/shared/api/required-query';
import { getData } from '@/shared/api/response';
import { useT } from '@/shared/i18n/react';

export const useApiKeys = (projectId: string | undefined) => {
  const t = useT();
  return useQuery({
    queryKey: queryKeys.apiKeys.all(projectId ?? ''),
    enabled: Boolean(projectId),
    queryFn: async ({ signal }) =>
      getData(
        await api.app.projects[':projectId']['api-keys'].$get(
          { param: { projectId: requireQueryValue(projectId, 'Project ID') } },
          { init: { signal } },
        ),
        t('settings.apiKeys.title'),
        z.array(z.lazy(() => apiKeySchema)),
      ),
  });
};
