import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { invitationInfoSchema, publicMetaSchema } from '@/integrations/nibleaf/contracts/responses/metadata';
import { api } from '@/integrations/nibleaf/endpoints';
import { getData } from '@/shared/api/response';

export const useGetPublicMeta = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ['public', 'meta'],
    enabled: options?.enabled ?? true,
    queryFn: async ({ signal }) =>
      getData(
        await api.public.meta.$get(undefined, { init: { signal } }),
        'public instance metadata',
        z.lazy(() => publicMetaSchema),
      ),
    staleTime: 5 * 60 * 1000,
  });

export const useGetInvitationInfo = (invitationId: string) =>
  useQuery({
    queryKey: ['public', 'invitations', invitationId],
    queryFn: async ({ signal }) =>
      getData(
        await api.public.invitations[':id'].$get({ param: { id: invitationId } }, { init: { signal } }),
        'invitation',
        z.lazy(() => invitationInfoSchema),
      ),
  });
