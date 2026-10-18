import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { queryKeys } from '@/integrations/nibleaf/cache-keys';
import { projectSchema } from '@/integrations/nibleaf/contracts/responses/projects';
import type { ProjectConfigUpdate } from '@/integrations/nibleaf/contracts/validators/project-config';
import type { CreateProjectBody, UpdateProjectBody } from '@/integrations/nibleaf/contracts/validators/projects';
import { api } from '@/integrations/nibleaf/endpoints';
import { acknowledgementSchema, mutateData } from '@/shared/api/response';

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateProjectBody) =>
      mutateData(
        await api.app.projects.$post({ json: body }),
        'Could not create the site.',
        z.lazy(() => projectSchema),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects.all() }),
  });
};

export const useUpdateProject = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateProjectBody) =>
      mutateData(
        await api.app.projects[':id'].$patch({ param: { id: projectId }, json: body }),
        'Could not update the site.',
        z.lazy(() => projectSchema),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.all() });
      qc.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
    },
  });
};

export const useUpdateProjectConfig = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ config, icon }: { config: ProjectConfigUpdate; icon?: string | null }) =>
      mutateData(
        await api.app.projects[':id'].$patch({ param: { id: projectId }, json: icon === undefined ? { config } : { config, icon } }),
        'Could not update the site configuration.',
        z.lazy(() => projectSchema),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.all() });
      qc.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
    },
  });
};

export const useDeleteProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) =>
      mutateData(await api.app.projects[':id'].$delete({ param: { id: projectId } }), 'Could not delete the site.', acknowledgementSchema),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects.all() }),
  });
};
