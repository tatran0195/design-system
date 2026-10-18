import { z } from 'zod';
import { url } from './search';
export const pageModeEnum = z.enum(['default', 'wide', 'center']);

export type PageMode = z.infer<typeof pageModeEnum>;

export const pageConfigSchema = z
  .object({
    seo: z
      .object({
        metaTitle: z.string().max(160).optional(),
        metaDescription: z.string().max(320).optional(),
        ogImage: url.optional(),
        canonicalUrl: url.optional(),
        noindex: z.boolean().optional(),
      })
      .strict()
      .optional(),
    /** Short label shown in the sidebar nav instead of the full title. */
    sidebarTitle: z.string().max(120).optional(),
    /** A short badge shown next to the nav label (Mintlify `tag`, e.g. "New", "Beta"). */
    tag: z.string().max(20).optional(),
    /** Source taxonomy retained by importers and shown on the article. */
    tags: z.array(z.string().min(1).max(40)).max(10).optional(),
    /** Virtual navigation section. Groups sibling pages without changing URLs. */
    category: z.string().max(80).optional(),
    /** Optional icon shown on the virtual category in the published sidebar. */
    categoryIcon: z.string().max(64).optional(),
    /** Stable ordering for virtual categories (lower values appear first). */
    categoryOrder: z.number().int().min(0).max(999).optional(),
    /** Content width on the live site. */
    mode: pageModeEnum.optional(),
    /** Hide the right-hand "On this page" table of contents. */
    hideToc: z.boolean().optional(),
  })
  .strict();

export type PageConfig = z.infer<typeof pageConfigSchema>;
