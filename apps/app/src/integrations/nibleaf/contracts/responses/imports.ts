/** Runtime wire response contracts. Schema output is checked against the DTO; no generic casts. */
import { z } from 'zod';
import type { ContentImportSummary } from '@/integrations/nibleaf/contracts/response-models/imports';
export const contentImportSummarySchema: z.ZodType<ContentImportSummary> = z.object({
  imported: z.number(),
  updated: z.number(),
  skipped: z.number(),
  assetsImported: z.number().optional(),
  assetsSkipped: z.number().optional(),
  warnings: z.array(z.string()),
});
