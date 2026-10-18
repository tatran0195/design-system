import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { queryKeys } from '@/integrations/nibleaf/cache-keys';
import { projectSchema } from '@/integrations/nibleaf/contracts/responses/projects';
import { api } from '@/integrations/nibleaf/endpoints';
import { requireQueryValue } from '@/shared/api/required-query';
import { getData } from '@/shared/api/response';

export const useProjects = () =>
  useQuery({
    queryKey: queryKeys.projects.all(),
    queryFn: async ({ signal }) =>
      getData(await api.app.projects.$get(undefined, { init: { signal } }), 'documentation sites', z.array(z.lazy(() => projectSchema))),
  });

export const useProject = (projectId: string | undefined) =>
  useQuery({
    queryKey: queryKeys.projects.detail(projectId ?? ''),
    enabled: Boolean(projectId),
    queryFn: async ({ signal }) =>
      getData(
        await api.app.projects[':id'].$get({ param: { id: requireQueryValue(projectId, 'Project ID') } }, { init: { signal } }),
        'project',
        z.lazy(() => projectSchema),
      ),
  });
