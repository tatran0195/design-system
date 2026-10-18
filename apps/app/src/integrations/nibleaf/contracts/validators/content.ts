import { z } from 'zod';
import { pageConfigSchema } from './page-config';
export const pageKindEnum = z.enum(['PAGE', 'GROUP']);

export const createPageBody = z.object({
  parentId: z.string().nullable().optional(),
  languageId: z.string().optional(),
  branchId: z.string().optional(),
  kind: pageKindEnum.optional(),
  title: z.string().min(1).max(200),
  slug: z.string().max(200).optional(),
  icon: z.string().max(64).nullable().optional(),
  description: z.string().max(500).nullable().optional(),
  content: z.string().optional(),
  config: pageConfigSchema.nullable().optional(),
  translationKey: z.string().trim().min(1).max(120).nullable().optional(),
  position: z.number().int().optional(),
});

export type CreatePageBody = z.infer<typeof createPageBody>;

export const listPagesQuery = z.object({ languageId: z.string().optional(), branchId: z.string().optional() });

export type ListPagesQuery = z.infer<typeof listPagesQuery>;

export const createBranchBody = z.object({
  name: z
    .string()
    .min(1)
    .max(60)
    .regex(/^[A-Za-z0-9._/-]+$/, 'Use letters, numbers, and . _ / -'),
  fromBranchId: z.string().optional(),
});

export type CreateBranchBody = z.infer<typeof createBranchBody>;

export const updatePageBody = z.object({
  parentId: z.string().nullable().optional(),
  title: z.string().min(1).max(200).optional(),
  slug: z.string().max(200).optional(),
  icon: z.string().max(64).nullable().optional(),
  description: z.string().max(500).nullable().optional(),
  content: z.string().optional(),
  config: pageConfigSchema.nullable().optional(),
  translationKey: z.string().trim().min(1).max(120).nullable().optional(),
  hidden: z.boolean().optional(),
});

export type UpdatePageBody = z.infer<typeof updatePageBody>;

export const reorderPagesBody = z.object({
  items: z.array(z.object({ id: z.string(), parentId: z.string().nullable(), position: z.number().int() })),
});

export type ReorderPagesBody = z.infer<typeof reorderPagesBody>;
