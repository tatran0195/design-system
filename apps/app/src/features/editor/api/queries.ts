import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { queryKeys } from '@/integrations/nibleaf/cache-keys';
import { commentSchema } from '@/integrations/nibleaf/contracts/responses/comments';
import { api } from '@/integrations/nibleaf/endpoints';
import { requireQueryValue } from '@/shared/api/required-query';
import { getData } from '@/shared/api/response';

export const useComments = (projectId: string | undefined, pageId?: string) =>
  useQuery({
    queryKey: queryKeys.comments.all(projectId ?? '', pageId),
    enabled: Boolean(projectId),
    queryFn: async ({ signal }) =>
      getData(
        await api.app.projects[':projectId'].comments.$get(
          {
            param: { projectId: requireQueryValue(projectId, 'Project ID') },
            query: pageId ? { pageId } : {},
          },
          { init: { signal } },
        ),
        'comments',
        z.array(z.lazy(() => commentSchema)),
      ),
  });
