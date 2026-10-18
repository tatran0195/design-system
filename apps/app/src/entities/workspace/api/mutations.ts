import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { queryKeys } from '@/integrations/nibleaf/cache-keys';
import { workspaceSettingsSchema } from '@/integrations/nibleaf/contracts/responses/projects';
import type { UpdateWorkspaceSettingsBody } from '@/integrations/nibleaf/contracts/validators/git-config';
import { api } from '@/integrations/nibleaf/endpoints';
import { mutateData } from '@/shared/api/response';

export const useUpdateWorkspaceSettings = (projectId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateWorkspaceSettingsBody) =>
      projectId
        ? mutateData(
            await api.app.projects[':projectId'].settings.$patch({ param: { projectId }, json: body }),
            'Could not update settings.',
            z.lazy(() => workspaceSettingsSchema),
          )
        : mutateData(
            await api.app.workspace.$patch({ json: body }),
            'Could not update workspace settings.',
            z.lazy(() => workspaceSettingsSchema),
          ),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectId ? queryKeys.workspace.projectSettings(projectId) : queryKeys.workspace.settings() }),
  });
};
