import { z } from 'zod';
import { contentImportSummarySchema } from '@/integrations/nibleaf/contracts/responses/imports';

export type { ContentImportSummary } from '@/integrations/nibleaf/contracts/response-models/imports';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/integrations/nibleaf/cache-keys';
import type { MintlifyImportBody } from '@/integrations/nibleaf/contracts/validators/exports';
import { api } from '@/integrations/nibleaf/endpoints';
import { mutateData } from '@/shared/api/response';

export const useImportFromMintlify = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: MintlifyImportBody) =>
      mutateData(
        await api.app.projects[':projectId'].settings.import.mintlify.$post({ param: { projectId }, json: body }),
        'Could not import from Mintlify.',
        z.lazy(() => contentImportSummarySchema),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.pages.allForProject(projectId) });
      // The importer may also fill empty project-config keys (branding, navbar, …).
      qc.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
      qc.invalidateQueries({ queryKey: queryKeys.projects.all() });
    },
  });
};

export const useImportFromGhost = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) =>
      mutateData(
        await api.app.projects[':projectId'].settings.import.ghost.$post({ param: { projectId }, json: body }),
        'Could not import from Ghost.',
        z.lazy(() => contentImportSummarySchema),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.pages.allForProject(projectId) }),
  });
};
