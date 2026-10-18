import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { queryKeys } from '@/integrations/nibleaf/cache-keys';
import { branchSchema, languageSchema, pageNodeSchema, pageSchema } from '@/integrations/nibleaf/contracts/responses/content';
import { api } from '@/integrations/nibleaf/endpoints';
import { requireQueryValue } from '@/shared/api/required-query';
import { getData } from '@/shared/api/response';

export const usePages = (projectId: string | undefined, languageId?: string, branchId?: string) =>
  useQuery({
    queryKey: queryKeys.pages.all(projectId ?? '', languageId, branchId),
    enabled: Boolean(projectId),
    queryFn: async ({ signal }) =>
      getData(
        await api.app.projects[':projectId'].pages.$get(
          {
            param: { projectId: requireQueryValue(projectId, 'Project ID') },
            query: { ...(languageId ? { languageId } : {}), ...(branchId ? { branchId } : {}) },
          },
          { init: { signal } },
        ),
        'pages',
        z.array(z.lazy(() => pageNodeSchema)),
      ),
  });

export const useLanguages = (projectId: string | undefined) =>
  useQuery({
    queryKey: queryKeys.languages.all(projectId ?? ''),
    enabled: Boolean(projectId),
    queryFn: async ({ signal }) =>
      getData(
        await api.app.projects[':projectId'].languages.$get(
          { param: { projectId: requireQueryValue(projectId, 'Project ID') } },
          { init: { signal } },
        ),
        'languages',
        z.array(z.lazy(() => languageSchema)),
      ),
  });

export const useBranches = (projectId: string | undefined) =>
  useQuery({
    queryKey: queryKeys.branches.all(projectId ?? ''),
    enabled: Boolean(projectId),
    queryFn: async ({ signal }) =>
      getData(
        await api.app.projects[':projectId'].branches.$get(
          { param: { projectId: requireQueryValue(projectId, 'Project ID') } },
          { init: { signal } },
        ),
        'branches',
        z.array(z.lazy(() => branchSchema)),
      ),
  });

export const usePage = (projectId: string | undefined, pageId: string | undefined) =>
  useQuery({
    queryKey: queryKeys.pages.detail(projectId ?? '', pageId ?? ''),
    enabled: Boolean(projectId && pageId),
    queryFn: async ({ signal }) =>
      getData(
        await api.app.projects[':projectId'].pages[':id'].$get(
          {
            param: { projectId: requireQueryValue(projectId, 'Project ID'), id: requireQueryValue(pageId, 'Page ID') },
          },
          { init: { signal } },
        ),
        'page',
        z.lazy(() => pageSchema),
      ),
  });
