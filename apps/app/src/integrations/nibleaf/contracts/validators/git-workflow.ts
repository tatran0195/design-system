import { z } from 'zod';
import type { GitConfig } from './git-config';
export const gitWebhookParams = z.object({ projectId: z.string().min(1).max(120) });

export type GitWebhookParams = z.infer<typeof gitWebhookParams>;

export type GitSyncStatus = 'ok' | 'failed';

export interface GitConfigStored extends GitConfig {
  /** Hex secret used to verify webhook deliveries. Server-generated only. */
  webhookSecret?: string;
  /** Last push-webhook sync attempt (set on success AND failure). */
  lastSyncAt?: string;
  lastSyncStatus?: GitSyncStatus;
  /** Present only when the last push sync failed. */
  lastSyncError?: string;
}

export const invalidGitBranchCharacter = (character: string): boolean =>
  character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127 || '~^:?*[\\'.includes(character) || /\s/.test(character);

export const gitBranchName = z
  .string()
  .trim()
  .min(1)
  .max(180)
  .refine(
    (branch) =>
      !branch.startsWith('.') &&
      !branch.endsWith('.') &&
      !branch.endsWith('/') &&
      !branch.includes('..') &&
      !branch.includes('@{') &&
      ![...branch].some(invalidGitBranchCharacter),
    'Use a valid Git branch name.',
  );

export const gitConnectionBody = z
  .object({
    repository: z
      .string()
      .trim()
      .max(220)
      .regex(/^(?:https:\/\/github\.com\/)?[\w.-]+\/[\w.-]+(?:\.git)?$/i, 'Use owner/repository or a GitHub repository URL.'),
    baseBranch: gitBranchName,
    headBranch: gitBranchName,
    contentPath: z.string().trim().max(300).optional(),
    importBranchId: z.string().max(120).optional(),
    importLanguageId: z.string().max(120).optional(),
    /** Fine-grained token: Repository metadata read, Contents read/write, Pull
     * requests read/write. Accepted once and never returned. */
    token: z.string().min(20).max(500).optional(),
  })
  .strict()
  .refine((body) => body.baseBranch !== body.headBranch, { message: 'Use a dedicated authoring branch.', path: ['headBranch'] });

export type GitConnectionBody = z.infer<typeof gitConnectionBody>;

export const gitAuthorizationBody = z
  .object({
    /** Fine-grained token used for a read-only identity check. It is never
     * persisted by the authorization endpoint. */
    token: z.string().min(20).max(500),
  })
  .strict();

export type GitAuthorizationBody = z.infer<typeof gitAuthorizationBody>;

export const gitOperationBody = z
  .object({
    idempotencyKey: z
      .string()
      .min(8)
      .max(160)
      .regex(/^[A-Za-z0-9._-]+$/),
    kind: z.enum(['PUSH', 'PULL']).default('PUSH'),
    commitMessage: z.string().trim().min(1).max(300).optional(),
    authorName: z.string().trim().min(1).max(120).optional(),
    authorEmail: z.email().max(254).optional(),
    createPullRequest: z.boolean().optional(),
    pullRequestTitle: z.string().trim().min(1).max(200).optional(),
    pullRequestBody: z.string().max(20_000).optional(),
    pullRequestNumber: z.number().int().positive().optional(),
    sourceRef: gitBranchName.optional(),
    sourceSha: z
      .string()
      .regex(/^[a-f0-9]{40,64}$/i)
      .optional(),
  })
  .strict()
  .superRefine((body, ctx) => {
    if (body.kind === 'PUSH') {
      for (const key of ['commitMessage', 'authorName', 'authorEmail'] as const) {
        if (!body[key]) ctx.addIssue({ code: 'custom', message: `${key} is required for a push.`, path: [key] });
      }
    }
  });

export type GitOperationBody = z.infer<typeof gitOperationBody>;

export const gitConflictResolutionBody = z
  .object({ resolution: z.enum(['OURS', 'THEIRS', 'CUSTOM']), content: z.string().max(2_000_000).nullable().optional() })
  .strict()
  .refine((body) => body.resolution !== 'CUSTOM' || body.content !== undefined, {
    message: 'Custom content is required; use null to delete the file.',
    path: ['content'],
  });

export type GitConflictResolutionBody = z.infer<typeof gitConflictResolutionBody>;
