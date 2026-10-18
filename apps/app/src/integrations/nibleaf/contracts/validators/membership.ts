import { z } from 'zod';

export const memberRoleEnum = z.enum(['owner', 'admin', 'member']);

export const assignableMemberRoleEnum = z.enum(['admin', 'member']);

export const inviteMemberBody = z.object({
  email: z.email(),
  // Invitations can never carry the owner role — see assignableMemberRoleEnum.
  role: assignableMemberRoleEnum.default('member'),
});

export type InviteMemberBody = z.infer<typeof inviteMemberBody>;

export const updateMemberRoleBody = z.object({ role: assignableMemberRoleEnum });

export type UpdateMemberRoleBody = z.infer<typeof updateMemberRoleBody>;

export const transferOwnershipBody = z.object({ memberId: z.string().min(1) });

export type TransferOwnershipBody = z.infer<typeof transferOwnershipBody>;
