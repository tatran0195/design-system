/** Runtime wire response contracts. Schema output is checked against the DTO; no generic casts. */
import { z } from 'zod';
import type { Comment } from '@/integrations/nibleaf/contracts/types';
export const commentSchema: z.ZodType<Comment> = z.object({
  id: z.string(),
  body: z.string(),
  resolved: z.boolean(),
  createdAt: z.string(),
  anchor: z.union([z.lazy(() => commentAnchorSchema), z.null()]).optional(),
  user: z.object({ id: z.string(), name: z.string(), image: z.union([z.string(), z.null()]) }),
});
export const commentAnchorSchema = z.object({ quote: z.string(), from: z.number().optional(), to: z.number().optional() });
