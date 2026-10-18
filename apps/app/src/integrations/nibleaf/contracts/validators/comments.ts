import { z } from 'zod';

export const listCommentsQuery = z.object({ pageId: z.string().optional() });

export type ListCommentsQuery = z.infer<typeof listCommentsQuery>;

export const aiDraftBody = z.object({
  mode: z.enum(['continue', 'rephrase', 'outline', 'summarize']),
  content: z.string().default(''),
  instruction: z.string().max(500).optional(),
});

export type AiDraftBody = z.infer<typeof aiDraftBody>;

export const boundedRecord = <V extends z.ZodTypeAny>(value: V) =>
  z.record(z.string().max(64), value).refine((r) => Object.keys(r).length <= 50, { message: 'Too many keys.' });
