/** Runtime wire response contracts. Schema output is checked against the DTO; no generic casts. */
import { z } from 'zod';
import type { Asset, Branch, Language, Page, PageNode } from '@/integrations/nibleaf/contracts/types';
import { languageConfigSchema } from '../validators/language-config';
import { pageConfigSchema } from '../validators/page-config';
import { safeUrlSchema } from './url';
export const languageSchema: z.ZodType<Language> = z.object({
  id: z.string(),
  projectId: z.string(),
  code: z.string(),
  config: z.union([languageConfigSchema.passthrough(), z.null()]).optional(),
  translation: z
    .union([
      z.object({
        id: z.string(),
        projectId: z.string(),
        languageId: z.string(),
        name: z.union([z.string(), z.null()]),
        description: z.union([z.string(), z.null()]),
      }),
      z.null(),
    ])
    .optional(),
  label: z.string(),
  direction: z.union([z.literal('LTR'), z.literal('RTL')]),
  isDefault: z.boolean(),
  enabled: z.boolean().optional(),
  position: z.number(),
  coverage: z
    .object({
      pageCount: z.number(),
      sourcePageCount: z.number(),
      matchedPages: z.number(),
      missingPages: z.number(),
      extraPages: z.number(),
      percentage: z.union([z.number(), z.null()]),
    })
    .optional(),
});
export const pageNodeSchema: z.ZodType<PageNode> = z.object({
  id: z.string(),
  parentId: z.union([z.string(), z.null()]),
  languageId: z.string(),
  kind: z.lazy(() => pageKindSchema),
  title: z.string(),
  slug: z.string(),
  path: z.string(),
  icon: z.union([z.string(), z.null()]),
  description: z.union([z.string(), z.null()]),
  config: z.union([pageConfigSchema.passthrough(), z.null()]).optional(),
  translationKey: z.union([z.string(), z.null()]).optional(),
  position: z.number(),
  hidden: z.boolean(),
  updatedAt: z.string(),
});
export const pageSchema: z.ZodType<Page> = z.object({
  id: z.string(),
  parentId: z.union([z.string(), z.null()]),
  languageId: z.string(),
  kind: z.lazy(() => pageKindSchema),
  title: z.string(),
  slug: z.string(),
  path: z.string(),
  icon: z.union([z.string(), z.null()]),
  description: z.union([z.string(), z.null()]),
  config: z.union([pageConfigSchema.passthrough(), z.null()]).optional(),
  translationKey: z.union([z.string(), z.null()]).optional(),
  position: z.number(),
  hidden: z.boolean(),
  updatedAt: z.string(),
  content: z.string(),
  projectId: z.string(),
  createdAt: z.string(),
});
export const branchSchema: z.ZodType<Branch> = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string(),
  isDefault: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export const assetSchema: z.ZodType<Asset> = z.object({
  id: z.string(),
  key: z.string(),
  url: safeUrlSchema,
  contentType: z.string(),
  size: z.number(),
  createdAt: z.string(),
});
export const pageKindSchema = z.union([z.literal('PAGE'), z.literal('GROUP')]);
