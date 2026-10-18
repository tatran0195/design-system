/** Runtime wire response contracts. Schema output is checked against the DTO; no generic casts. */
import { z } from 'zod';
import type {
  GitIdentity,
  GitWebhookSecret,
  Invitation,
  InvitationInfo,
  Member,
  MembersResult,
  PendingChanges,
  PresignedUpload,
  PublicMeta,
} from '@/integrations/nibleaf/contracts/response-types';
import { pendingChangeSchema } from './publishing';
import { redirectValidationIssueSchema } from './redirects';
import { safeUrlSchema } from './url';
export const pendingChangesSchema: z.ZodType<PendingChanges> = z.object({
  hasBaseline: z.boolean(),
  lastVersion: z.union([z.number(), z.null()]),
  lastPublishedAt: z.union([z.string(), z.null()]),
  changes: z.array(z.lazy(() => pendingChangeSchema)),
  redirectIssues: z.array(z.lazy(() => redirectValidationIssueSchema)),
});
export const publicMetaSchema: z.ZodType<PublicMeta> = z.object({ providers: z.object({ google: z.boolean() }), signupDisabled: z.boolean() });
export const invitationInfoSchema: z.ZodType<InvitationInfo> = z.object({
  id: z.string(),
  email: z.string(),
  role: z.string(),
  status: z.string(),
  organizationName: z.union([z.string(), z.null()]),
  expired: z.boolean(),
});
export const membersResultSchema: z.ZodType<MembersResult> = z.object({
  members: z.array(z.lazy(() => memberSchema)),
  invitations: z.array(z.lazy(() => invitationSchema)),
});
export const invitationSchema: z.ZodType<Invitation> = z.object({
  id: z.string(),
  organizationId: z.string(),
  email: z.string(),
  role: z.string(),
  status: z.string(),
  expiresAt: z.string(),
  inviterId: z.string(),
});
export const gitIdentitySchema: z.ZodType<GitIdentity> = z.object({ login: z.string(), name: z.union([z.string(), z.null()]) });
export const gitWebhookSecretSchema: z.ZodType<GitWebhookSecret> = z.object({ webhookSecret: z.string() });
export const presignedUploadSchema: z.ZodType<PresignedUpload> = z.object({ key: z.string(), uploadUrl: safeUrlSchema });
export const memberSchema: z.ZodType<Member> = z.object({
  id: z.string(),
  organizationId: z.string(),
  userId: z.string(),
  role: z.string(),
  createdAt: z.string(),
  user: z.object({ id: z.string(), name: z.string(), email: z.string(), image: z.union([z.string(), z.null()]) }),
});
