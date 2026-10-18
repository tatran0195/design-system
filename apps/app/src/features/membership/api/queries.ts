import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { queryKeys } from '@/integrations/nibleaf/cache-keys';
import { membersResultSchema } from '@/integrations/nibleaf/contracts/responses/metadata';
import { api } from '@/integrations/nibleaf/endpoints';
import { requireQueryValue } from '@/shared/api/required-query';
import { getData } from '@/shared/api/response';

export const useMembers = () =>
  useQuery({
    queryKey: queryKeys.members.all(),
    queryFn: async ({ signal }) =>
      getData(
        await api.app.members.$get(undefined, { init: { signal } }),
        'members',
        z.lazy(() => membersResultSchema),
      ),
  });

export const useProjectMembers = (projectId: string | undefined) =>
  useQuery({
    queryKey: queryKeys.members.forProject(projectId ?? ''),
    enabled: Boolean(projectId),
    queryFn: async ({ signal }) =>
      getData(
        await api.app.projects[':projectId'].members.$get({ param: { projectId: requireQueryValue(projectId, 'Project ID') } }, { init: { signal } }),
        'members',
        z.lazy(() => membersResultSchema),
      ),
  });
