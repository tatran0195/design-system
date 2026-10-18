import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { queryKeys } from '@/integrations/nibleaf/cache-keys';
import { workspaceSettingsSchema } from '@/integrations/nibleaf/contracts/responses/projects';
import { api } from '@/integrations/nibleaf/endpoints';
import { getData } from '@/shared/api/response';

export const useWorkspaceSettings = (projectId?: string) =>
  useQuery({
    queryKey: projectId ? queryKeys.workspace.projectSettings(projectId) : queryKeys.workspace.settings(),
    queryFn: async ({ signal }) =>
      projectId
        ? getData(
            await api.app.projects[':projectId'].settings.$get({ param: { projectId } }, { init: { signal } }),
            'site settings',
            z.lazy(() => workspaceSettingsSchema),
          )
        : getData(
            await api.app.workspace.$get(undefined, { init: { signal } }),
            'workspace settings',
            z.lazy(() => workspaceSettingsSchema),
          ),
  });
