import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { queryKeys } from '@/integrations/nibleaf/cache-keys';
import { invitationSchema } from '@/integrations/nibleaf/contracts/responses/metadata';
import type { InviteMemberBody, TransferOwnershipBody, UpdateMemberRoleBody } from '@/integrations/nibleaf/contracts/validators/membership';
import { api } from '@/integrations/nibleaf/endpoints';
import { acknowledgementSchema, mutateData } from '@/shared/api/response';

export const useInviteMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: InviteMemberBody) =>
      mutateData(
        await api.app.members.invite.$post({ json: body }),
        'Could not send the invite.',
        z.lazy(() => invitationSchema),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.members.all() }),
  });
};

export const useUpdateMemberRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateMemberRoleBody }) =>
      mutateData(await api.app.members[':id'].role.$patch({ param: { id }, json: body }), 'Could not update the role.', acknowledgementSchema),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.members.all() }),
  });
};

export const useRemoveMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      mutateData(await api.app.members[':id'].$delete({ param: { id } }), 'Could not remove the member.', acknowledgementSchema),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.members.all() }),
  });
};

export const useInviteProjectMember = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: InviteMemberBody) =>
      mutateData(
        await api.app.projects[':projectId'].members.invite.$post({ param: { projectId }, json: body }),
        'Could not send the invite.',
        z.lazy(() => invitationSchema),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.members.forProject(projectId) }),
  });
};

export const useUpdateProjectMemberRole = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateMemberRoleBody }) =>
      mutateData(
        await api.app.projects[':projectId'].members[':id'].role.$patch({ param: { projectId, id }, json: body }),
        'Could not update the role.',
        acknowledgementSchema,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.members.forProject(projectId) }),
  });
};

export const useTransferProjectOwnership = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: TransferOwnershipBody) =>
      mutateData(
        await api.app.projects[':projectId'].members['transfer-ownership'].$post({ param: { projectId }, json: body }),
        'Could not transfer ownership.',
        acknowledgementSchema,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.members.forProject(projectId) }),
  });
};

export const useRemoveProjectMember = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      mutateData(
        await api.app.projects[':projectId'].members[':id'].$delete({ param: { projectId, id } }),
        'Could not remove the member.',
        acknowledgementSchema,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.members.forProject(projectId) }),
  });
};

export const useCancelProjectInvitation = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      mutateData(
        await api.app.projects[':projectId'].members.invitations[':id'].$delete({ param: { projectId, id } }),
        'Could not revoke the invitation.',
        acknowledgementSchema,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.members.forProject(projectId) }),
  });
};
