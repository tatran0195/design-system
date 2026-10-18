/** Runtime wire response contracts. Schema output is checked against the DTO; no generic casts. */
import { z } from 'zod';
import type { GitConflict, GitOperation, GitWorkflowStatus } from '@/integrations/nibleaf/contracts/response-models/git';
import { safeUrlSchema } from './url';
export const gitWorkflowStatusSchema: z.ZodType<GitWorkflowStatus> = z.object({
  id: z.string(),
  repository: z.string(),
  baseBranch: z.string(),
  headBranch: z.string(),
  contentPath: z.string(),
  credentialConfigured: z.boolean(),
  webhookConfigured: z.boolean(),
  lastSyncStatus: z.string(),
  lastSyncError: z.union([z.string(), z.null()]),
  lastSyncedAt: z.union([z.string(), z.null()]),
  operations: z.array(z.lazy(() => gitOperationSchema)),
  pullRequests: z.array(
    z.object({
      id: z.string(),
      number: z.number(),
      url: safeUrlSchema,
      title: z.string(),
      draft: z.boolean(),
      state: z.string(),
      previews: z.array(
        z.object({ id: z.string(), status: z.string(), url: z.union([z.string(), z.null()]), error: z.union([z.string(), z.null()]) }),
      ),
    }),
  ),
  files: z.array(z.object({ path: z.string() })),
});
export const gitOperationSchema: z.ZodType<GitOperation> = z.object({
  id: z.string(),
  kind: z.string(),
  status: z.string(),
  commitMessage: z.union([z.string(), z.null()]),
  changedFiles: z.union([z.array(z.object({ path: z.string(), status: z.string() })), z.null()]),
  pullRequestNo: z.union([z.number(), z.null()]),
  pullRequestUrl: z.union([z.string(), z.null()]),
  error: z.union([z.string(), z.null()]),
  createdAt: z.string(),
  conflicts: z.array(z.lazy(() => gitConflictSchema)),
});
export const gitConflictSchema: z.ZodType<GitConflict> = z.object({
  id: z.string(),
  path: z.string(),
  status: z.string(),
  baseContent: z.union([z.string(), z.null()]),
  oursContent: z.union([z.string(), z.null()]),
  theirsContent: z.union([z.string(), z.null()]),
});
