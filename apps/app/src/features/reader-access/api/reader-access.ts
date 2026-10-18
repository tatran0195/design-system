import { z } from 'zod';
import { readerAccessDataSchema } from '@/integrations/nibleaf/contracts/responses/reader-access';
import { safeUrlSchema } from '@/integrations/nibleaf/contracts/responses/url';
import { acknowledgementSchema } from '@/shared/api/response';

export type { ReaderAccessData } from '@/integrations/nibleaf/contracts/response-models/reader-access';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/integrations/nibleaf/cache-keys';
import type {
  CreateAudienceBody,
  InviteReaderBody,
  JwtAccessConfigBody,
  ProjectAccessModeBody,
} from '@/integrations/nibleaf/contracts/validators/reader-access';
import { api } from '@/integrations/nibleaf/endpoints';
import { getData, mutateData } from '@/shared/api/response';

export const useReaderAccess = (projectId: string) =>
  useQuery({
    queryKey: queryKeys.readerAccess.detail(projectId),
    queryFn: async ({ signal }) =>
      getData(
        await api.app.projects[':projectId']['reader-access'].$get({ param: { projectId } }, { init: { signal } }),
        'reader access settings',
        z.lazy(() => readerAccessDataSchema),
      ),
  });

const useReaderAccessMutation = <TVariables, TResult>(projectId: string, mutationFn: (variables: TVariables) => Promise<TResult>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.readerAccess.detail(projectId) }),
  });
};

export const useUpdateReaderAccessMode = (projectId: string) =>
  useReaderAccessMutation(projectId, async (json: ProjectAccessModeBody) =>
    mutateData(
      await api.app.projects[':projectId']['reader-access'].mode.$put({ param: { projectId }, json }),
      'Could not update the reader access mode.',
      acknowledgementSchema,
    ),
  );

export const useCreateReaderAudience = (projectId: string) =>
  useReaderAccessMutation(projectId, async (json: CreateAudienceBody) =>
    mutateData(
      await api.app.projects[':projectId']['reader-access'].audiences.$post({ param: { projectId }, json }),
      'Could not create the reader audience.',
      acknowledgementSchema,
    ),
  );

export const useDeleteReaderAudience = (projectId: string) =>
  useReaderAccessMutation(projectId, async (audienceId: string) =>
    mutateData(
      await api.app.projects[':projectId']['reader-access'].audiences[':audienceId'].$delete({ param: { projectId, audienceId } }),
      'Could not delete the reader audience.',
      acknowledgementSchema,
    ),
  );

export const useInviteReader = (projectId: string) =>
  useReaderAccessMutation(projectId, async (json: InviteReaderBody) =>
    mutateData(
      await api.app.projects[':projectId']['reader-access'].readers.invite.$post({ param: { projectId }, json }),
      'Could not invite the reader.',
      z.object({ activationUrl: safeUrlSchema }),
    ),
  );

export const useRevokeReader = (projectId: string) =>
  useReaderAccessMutation(projectId, async (readerId: string) =>
    mutateData(
      await api.app.projects[':projectId']['reader-access'].readers[':readerId'].revoke.$post({ param: { projectId, readerId } }),
      'Could not revoke the reader.',
      acknowledgementSchema,
    ),
  );

export const useUpdateReaderJwt = (projectId: string) =>
  useReaderAccessMutation(projectId, async (json: JwtAccessConfigBody) =>
    mutateData(
      await api.app.projects[':projectId']['reader-access'].jwt.$put({ param: { projectId }, json }),
      'Could not update the reader JWT configuration.',
      acknowledgementSchema,
    ),
  );

export const useTestReaderJwt = (projectId: string) =>
  useMutation({
    mutationFn: async (token: string) =>
      mutateData(
        await api.app.projects[':projectId']['reader-access'].jwt.test.$post({ param: { projectId }, json: { token } }),
        'Could not validate the reader JWT.',
        acknowledgementSchema,
      ),
  });

export const useEmergencyRevokeReaderAccess = (projectId: string) =>
  useReaderAccessMutation(projectId, async (_: undefined) =>
    mutateData(
      await api.app.projects[':projectId']['reader-access']['emergency-revoke'].$post({ param: { projectId } }),
      'Could not revoke reader access.',
      acknowledgementSchema,
    ),
  );
