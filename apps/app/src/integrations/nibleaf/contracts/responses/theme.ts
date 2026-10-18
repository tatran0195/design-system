/** Runtime wire response contracts. Schema output is checked against the DTO; no generic casts. */
import { z } from 'zod';
import type { ProjectThemeImportResult } from '@/integrations/nibleaf/contracts/response-models/theme';
import { themeTemplateV1Schema } from '../validators/themes';
import { resolvedThemeSchema, themeConfigChangeSchema } from './themes';
export const projectThemeImportResultSchema: z.ZodType<ProjectThemeImportResult> = z.object({
  applied: z.boolean(),
  mode: z.union([z.literal('merge'), z.literal('replace')]),
  migratedFrom: z.literal(0).optional(),
  changes: z.array(z.lazy(() => themeConfigChangeSchema)),
  theme: z.lazy(() => resolvedThemeSchema),
  template: themeTemplateV1Schema,
  publishedChangesPending: z.boolean(),
});
