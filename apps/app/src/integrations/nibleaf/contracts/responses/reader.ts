/** Runtime wire response contracts. Schema output is checked against the DTO; no generic casts. */
import { z } from 'zod';
import type { ChangelogEntry, NavNode, SearchAnswer, SitePage, SiteSearchHit, SiteShell } from '@/integrations/nibleaf/contracts/types';
import { languageConfigSchema } from '../validators/language-config';
import { pageConfigSchema } from '../validators/page-config';
import { projectConfigSchema } from '../validators/project-config';
import { pageKindSchema } from './content';
export const siteShellSchema: z.ZodType<SiteShell> = z.object({
  project: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    description: z.union([z.string(), z.null()]),
    config: z.union([projectConfigSchema.passthrough(), z.null()]),
    primaryDomain: z.union([z.string(), z.null()]),
  }),
  nav: z.array(z.lazy(() => navNodeSchema)),
  languages: z.array(
    z.object({
      code: z.string(),
      label: z.string(),
      direction: z.union([z.literal('LTR'), z.literal('RTL')]),
      isDefault: z.boolean(),
      enabled: z.boolean().optional(),
    }),
  ),
  versions: z.array(z.object({ id: z.string(), name: z.string(), slug: z.string(), isDefault: z.boolean() })),
  activeLanguage: z.string(),
  activeVersion: z.string(),
  languageConfig: z.union([z.lazy(() => publishedLanguageConfigSchema), z.null()]),
  version: z.number(),
  generatedAt: z.string(),
  openapi: z.union([z.lazy(() => publishedOpenApiSchema), z.null()]).optional(),
});
export const sitePageSchema: z.ZodType<SitePage> = z.object({
  project: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    description: z.union([z.string(), z.null()]),
    config: z.union([projectConfigSchema.passthrough(), z.null()]),
    primaryDomain: z.union([z.string(), z.null()]),
  }),
  page: z.object({
    id: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    title: z.string(),
    description: z.union([z.string(), z.null()]),
    excerpt: z.string(),
    icon: z.union([z.string(), z.null()]),
    path: z.string(),
    content: z.string(),
    headings: z.array(z.lazy(() => headingSchema)),
    config: z.union([pageConfigSchema.passthrough(), z.null()]),
  }),
  activeLanguage: z.string(),
  activeVersion: z.string(),
  versions: z.array(z.object({ id: z.string(), name: z.string(), slug: z.string(), isDefault: z.boolean() })),
  languageConfig: z.union([z.lazy(() => publishedLanguageConfigSchema), z.null()]),
  languages: z.array(z.object({ code: z.string(), isDefault: z.boolean(), path: z.union([z.string(), z.null()]) })),
  breadcrumbs: z.array(z.object({ title: z.string(), path: z.string() })),
  prev: z.union([z.object({ title: z.string(), path: z.string() }), z.null()]),
  next: z.union([z.object({ title: z.string(), path: z.string() }), z.null()]),
});
export const siteSearchHitSchema: z.ZodType<SiteSearchHit> = z.object({
  id: z.string(),
  title: z.string(),
  path: z.string(),
  description: z.string(),
  icon: z.string().optional(),
  snippet: z.string(),
  score: z.number(),
  language: z.string(),
});
export const searchAnswerSchema: z.ZodType<SearchAnswer> = z.object({
  status: z.union([z.literal('answered'), z.literal('no_answer')]),
  answer: z.string(),
  confidence: z.number(),
  citations: z.array(z.lazy(() => searchCitationSchema)),
  model: z.string().optional(),
  cacheHit: z.boolean(),
  quotaRemaining: z.number(),
});
export const changelogEntrySchema: z.ZodType<ChangelogEntry> = z.object({
  version: z.number(),
  date: z.union([z.string(), z.null()]),
  title: z.string(),
  pages: z.number(),
});
export const navNodeSchema: z.ZodType<NavNode> = z.object({
  id: z.string(),
  kind: z.lazy(() => pageKindSchema),
  title: z.string(),
  path: z.string(),
  icon: z.union([z.string(), z.null()]),
  tag: z.union([z.string(), z.null()]),
  children: z.array(z.lazy(() => navNodeSchema)),
});
export const publishedLanguageConfigSchema = z.intersection(
  languageConfigSchema.passthrough(),
  z.object({ name: z.string().optional(), description: z.string().optional() }),
);
export const publishedOpenApiSchema = z.object({ title: z.string(), path: z.string(), contentHash: z.string(), updatedAt: z.string() });
export const headingSchema = z.object({ depth: z.number(), text: z.string(), id: z.string() });
export const searchCitationSchema = z.object({
  id: z.string(),
  pageId: z.string(),
  title: z.string(),
  path: z.string(),
  heading: z.string().optional(),
  snippet: z.string(),
  direction: z.union([z.literal('ltr'), z.literal('rtl')]),
});
