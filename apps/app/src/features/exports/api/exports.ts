import { z } from 'zod';
import type { ExportFormat } from '@/integrations/nibleaf/contracts/response-models/exports';
import { exportRunSchema, exportScheduleSchema } from '@/integrations/nibleaf/contracts/responses/exports';
import { safeUrlSchema } from '@/integrations/nibleaf/contracts/responses/url';

export type { ExportArtifact, ExportFormat, ExportRun, ExportSchedule, ExportStatus } from '@/integrations/nibleaf/contracts/response-models/exports';

import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/integrations/nibleaf/cache-keys';
import type { CreateExportScheduleBody, UpdateExportScheduleBody } from '@/integrations/nibleaf/contracts/validators/exports';
import { api } from '@/integrations/nibleaf/endpoints';
import { getData, mutateData } from '@/shared/api/response';

const invalidateExports = (queryClient: QueryClient, projectId: string) =>
  queryClient.invalidateQueries({ queryKey: queryKeys.exports.all(projectId) });

export const useListExportRuns = (projectId: string) =>
  useQuery({
    queryKey: queryKeys.exports.runs(projectId),
    queryFn: async ({ signal }) =>
      getData(
        await api.app.projects[':projectId'].exports.$get({ param: { projectId } }, { init: { signal } }),
        'export runs',
        z.array(z.lazy(() => exportRunSchema)),
      ),
    refetchInterval: (query) => (query.state.data?.some((run) => run.status === 'PENDING' || run.status === 'RUNNING') ? 2500 : false),
  });

export const useListExportSchedules = (projectId: string) =>
  useQuery({
    queryKey: queryKeys.exports.schedules(projectId),
    queryFn: async ({ signal }) =>
      getData(
        await api.app.projects[':projectId'].exports.schedules.$get({ param: { projectId } }, { init: { signal } }),
        'export schedules',
        z.array(z.lazy(() => exportScheduleSchema)),
      ),
  });

export const useCreateExport = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formats: ExportFormat[]) =>
      mutateData(
        await api.app.projects[':projectId'].exports.$post({ param: { projectId }, json: { formats } }),
        'Could not queue the export.',
        z.lazy(() => exportRunSchema),
      ),
    onSuccess: () => invalidateExports(queryClient, projectId),
  });
};

export const useCancelExport = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      mutateData(
        await api.app.projects[':projectId'].exports[':id'].cancel.$post({ param: { projectId, id } }),
        'Could not cancel the export.',
        z.lazy(() => exportRunSchema),
      ),
    onSuccess: () => invalidateExports(queryClient, projectId),
  });
};

export const useGetExportDownload = (projectId: string) =>
  useMutation({
    mutationFn: async ({ runId, artifactId }: { runId: string; artifactId: string }) =>
      getData(
        await api.app.projects[':projectId'].exports[':id'].artifacts[':artifactId'].download.$get({
          param: { projectId, id: runId, artifactId },
        }),
        'download URL',
        z.object({ url: safeUrlSchema }),
      ),
  });

export const useCreateExportSchedule = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateExportScheduleBody) =>
      mutateData(
        await api.app.projects[':projectId'].exports.schedules.$post({ param: { projectId }, json: body }),
        'Could not create the export schedule.',
        z.lazy(() => exportScheduleSchema),
      ),
    onSuccess: () => invalidateExports(queryClient, projectId),
  });
};

export const useUpdateExportSchedule = (projectId: string, scheduleId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateExportScheduleBody) =>
      mutateData(
        await api.app.projects[':projectId'].exports.schedules[':scheduleId'].$patch({ param: { projectId, scheduleId }, json: body }),
        'Could not update the export schedule.',
        z.lazy(() => exportScheduleSchema),
      ),
    onSuccess: () => invalidateExports(queryClient, projectId),
  });
};

export const useRunExportSchedule = (projectId: string, scheduleId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      mutateData(
        await api.app.projects[':projectId'].exports.schedules[':scheduleId'].run.$post({ param: { projectId, scheduleId } }),
        'Could not run the export schedule.',
        z.lazy(() => exportRunSchema),
      ),
    onSuccess: () => invalidateExports(queryClient, projectId),
  });
};
