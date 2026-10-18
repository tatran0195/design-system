/** Runtime wire response contracts. Schema output is checked against the DTO; no generic casts. */
import { z } from 'zod';
import type {
  SiteSnapshot,
  SnapshotLanguage,
  SnapshotLanguageConfig,
  SnapshotNavAnchor,
  SnapshotNavLink,
  SnapshotOpenApi,
  SnapshotPage,
  SnapshotPageConfig,
  SnapshotProject,
  SnapshotVersion,
} from '@/integrations/nibleaf/contracts/shared/site';
import { safeUrlSchema } from './url';
export const siteSnapshotSchema: z.ZodType<SiteSnapshot> = z.object({
  project: z.lazy(() => snapshotProjectSchema),
  pages: z.array(z.lazy(() => snapshotPageSchema)),
  openapi: z.union([z.lazy(() => snapshotOpenApiSchema), z.null()]).optional(),
  generatedAt: z.string(),
});
export const snapshotProjectSchema: z.ZodType<SnapshotProject> = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.union([z.string(), z.null()]),
  icon: z.union([z.string(), z.null()]),
  config: z.union([z.record(z.string(), z.unknown()), z.null()]),
  languages: z.array(z.lazy(() => snapshotLanguageSchema)),
  versions: z.array(z.lazy(() => snapshotVersionSchema)),
});
export const snapshotPageSchema: z.ZodType<SnapshotPage> = z.object({
  id: z.string(),
  parentId: z.union([z.string(), z.null()]),
  versionId: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string(),
  languageCode: z.string(),
  kind: z.union([z.literal('PAGE'), z.literal('GROUP')]),
  title: z.string(),
  slug: z.string(),
  path: z.string(),
  icon: z.union([z.string(), z.null()]),
  description: z.union([z.string(), z.null()]),
  content: z.string(),
  config: z.union([z.lazy(() => snapshotPageConfigSchema), z.null()]),
  translationKey: z.union([z.string(), z.null()]),
  position: z.number(),
  hidden: z.boolean(),
});
export const snapshotOpenApiSchema: z.ZodType<SnapshotOpenApi> = z.object({
  title: z.string(),
  path: z.string(),
  contentHash: z.string(),
  updatedAt: z.string(),
  document: z.record(z.string(), z.unknown()),
});
export const snapshotLanguageSchema: z.ZodType<SnapshotLanguage> = z.object({
  code: z.string(),
  label: z.string(),
  direction: z.union([z.literal('LTR'), z.literal('RTL')]),
  isDefault: z.boolean(),
  enabled: z.boolean().optional(),
  config: z.union([z.lazy(() => snapshotLanguageConfigSchema), z.null()]),
});
export const snapshotVersionSchema: z.ZodType<SnapshotVersion> = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  isDefault: z.boolean(),
});
export const snapshotPageConfigSchema: z.ZodType<SnapshotPageConfig> = z.object({
  seo: z
    .object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      ogImage: z.string().optional(),
      canonicalUrl: z.string().optional(),
      noindex: z.boolean().optional(),
    })
    .optional(),
  sidebarTitle: z.string().optional(),
  tag: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  categoryIcon: z.string().optional(),
  categoryOrder: z.number().optional(),
  mode: z.union([z.literal('default'), z.literal('wide'), z.literal('center')]).optional(),
  hideToc: z.boolean().optional(),
});
export const snapshotLanguageConfigSchema: z.ZodType<SnapshotLanguageConfig> = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  seo: z
    .object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      socialImage: z.string().optional(),
      allowIndex: z.boolean().optional(),
    })
    .optional(),
  navbar: z
    .union([
      z.object({
        ctaLabel: z.string().optional(),
        links: z.array(z.lazy(() => snapshotNavLinkSchema)).optional(),
        tabs: z.array(z.lazy(() => snapshotNavLinkSchema)).optional(),
        anchors: z.array(z.lazy(() => snapshotNavAnchorSchema)).optional(),
      }),
      z.null(),
    ])
    .optional(),
  footer: z.union([z.object({ copyright: z.string().optional() }), z.null()]).optional(),
  banner: z
    .union([
      z.object({
        enabled: z.boolean().optional(),
        message: z.string().optional(),
        linkLabel: z.string().optional(),
        linkUrl: z.string().optional(),
        dismissible: z.boolean().optional(),
      }),
      z.null(),
    ])
    .optional(),
  search: z.union([z.object({ placeholder: z.string().optional() }), z.null()]).optional(),
});
export const snapshotNavLinkSchema: z.ZodType<SnapshotNavLink> = z.object({
  label: z.string(),
  href: safeUrlSchema,
  external: z.boolean().optional(),
});
export const snapshotNavAnchorSchema: z.ZodType<SnapshotNavAnchor> = z.object({
  label: z.string(),
  href: safeUrlSchema,
  external: z.boolean().optional(),
  icon: z.string().optional(),
});
