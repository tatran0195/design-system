/** Runtime wire response contracts. Schema output is checked against the DTO; no generic casts. */
import { z } from 'zod';
import type { RedirectIssueCode, RedirectValidationIssue } from '@/integrations/nibleaf/contracts/shared/redirects';
export const redirectValidationIssueSchema: z.ZodType<RedirectValidationIssue> = z.object({
  code: z.lazy(() => redirectIssueCodeSchema),
  message: z.string(),
  sequence: z.array(z.string()),
  rowIndexes: z.array(z.number()),
  field: z.union([z.literal('from'), z.literal('to')]).optional(),
});
export const redirectIssueCodeSchema: z.ZodType<RedirectIssueCode> = z.union([
  z.literal('malformed-source'),
  z.literal('malformed-destination'),
  z.literal('duplicate-source'),
  z.literal('self-redirect'),
  z.literal('cycle'),
  z.literal('chain-too-long'),
  z.literal('too-many-rules'),
  z.literal('source-collision'),
  z.literal('destination-not-found'),
  z.literal('invalid-locale'),
  z.literal('route-collision'),
]);
