import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/integrations/nibleaf/cache-keys';
import {
  searchConfigurationResultSchema,
  searchIndexDiagnosticsResultSchema,
  type UpdateProjectSearchConfigurationBody,
  updateProjectSearchConfigurationBody,
} from '@/integrations/nibleaf/contracts/validators/search';
import { api } from '@/integrations/nibleaf/endpoints';
import { acknowledgementSchema, getData, mutateData } from '@/shared/api/response';

export const useProjectSearchConfiguration = (projectId: string) =>
  useQuery({
    queryKey: queryKeys.projectSearch.configuration(projectId),
    queryFn: async ({ signal }) =>
      searchConfigurationResultSchema.parse(
        await getData(
          await api.app.projects[':projectId'].settings.search.$get({ param: { projectId } }, { init: { signal } }),
          'search configuration',
          searchConfigurationResultSchema,
        ),
      ),
  });

export const useUpdateProjectSearchConfiguration = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateProjectSearchConfigurationBody) =>
      mutateData(
        await api.app.projects[':projectId'].settings.search.$patch({
          param: { projectId },
          json: updateProjectSearchConfigurationBody.parse(body),
        }),
        'Could not update search configuration.',
        searchConfigurationResultSchema,
      ),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.projectSearch.configuration(projectId), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.site.shell(projectId) });
      queryClient.invalidateQueries({ queryKey: ['site', projectId, 'search'] });
    },
  });
};

export const useProjectSearchIndexDiagnostics = (projectId: string, cursor?: string, limit = 10) =>
  useQuery({
    queryKey: queryKeys.projectSearch.index(projectId, cursor, limit),
    queryFn: async ({ signal }) =>
      getData(
        await api.app.projects[':projectId'].settings.search.diagnostics.$get(
          {
            param: { projectId },
            query: { limit: String(limit), ...(cursor ? { cursor } : {}) },
          },
          { init: { signal } },
        ),
        'search index diagnostics',
        searchIndexDiagnosticsResultSchema,
      ).then((data) => searchIndexDiagnosticsResultSchema.parse(data)),
    refetchInterval: (query) => (query.state.data?.health === 'indexing' ? 2000 : false),
  });

export const useCreateProjectSearchReindex = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      mutateData(
        await api.app.projects[':projectId'].settings.search.reindex.$post({ param: { projectId } }),
        'Could not queue search indexing.',
        acknowledgementSchema,
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.projectSearch.allIndex(projectId) }),
  });
};
