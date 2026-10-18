/** Runtime wire response contracts. Schema output is checked against the DTO; no generic casts. */
import { z } from 'zod';
import type { Deployment, DeploymentStatus, PendingChange } from '@/integrations/nibleaf/contracts/types';
export const deploymentSchema: z.ZodType<Deployment> = z.object({
  id: z.string(),
  version: z.number(),
  status: z.lazy(() => deploymentStatusSchema),
  pagesCount: z.number(),
  commitMessage: z.union([z.string(), z.null()]),
  error: z.union([z.string(), z.null()]),
  errorDetails: z.union([z.array(z.lazy(() => deploymentIssueSchema)), z.null()]).optional(),
  createdAt: z.string(),
  completedAt: z.union([z.string(), z.null()]),
});
export const deploymentStatusSchema: z.ZodType<DeploymentStatus> = z.union([
  z.literal('PENDING'),
  z.literal('BUILDING'),
  z.literal('READY'),
  z.literal('FAILED'),
]);
export const deploymentIssueSchema = z.object({
  type: z.union([z.literal('broken-link'), z.literal('grammar')]),
  pageTitle: z.string(),
  pagePath: z.string(),
  detail: z.string(),
});
export const pendingChangeSchema: z.ZodType<PendingChange> = z.object({
  id: z.string(),
  title: z.string(),
  path: z.string(),
  languageCode: z.string(),
  kind: z.union([z.literal('PAGE'), z.literal('GROUP')]),
  status: z.union([z.literal('added'), z.literal('modified'), z.literal('removed')]),
  fields: z.array(z.string()),
  additions: z.number(),
  deletions: z.number(),
  lines: z.array(z.lazy(() => deploymentDiffLineSchema)),
  truncated: z.boolean(),
});
export const deploymentDiffLineSchema = z.object({
  type: z.union([z.literal('added'), z.literal('removed'), z.literal('unchanged')]),
  text: z.string(),
  oldLine: z.union([z.number(), z.null()]),
  newLine: z.union([z.number(), z.null()]),
});
