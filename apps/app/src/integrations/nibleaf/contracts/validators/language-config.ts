import { z } from 'zod';
import { navAnchor, navLink, url } from './search';
export const languageConfigSchema = z
  .object({
    seo: z
      .object({
        metaTitle: z.string().max(160).optional(),
        metaDescription: z.string().max(320).optional(),
        socialImage: url.optional(),
        allowIndex: z.boolean().optional(),
      })
      .strict()
      .optional(),
    /** Localized navbar labels/links (CTA URL, search + changelog toggles stay global). */
    navbar: z
      .object({
        ctaLabel: z.string().max(60).optional(),
        links: z.array(navLink).max(20).optional(),
        tabs: z.array(navLink).max(10).optional(),
        anchors: z.array(navAnchor).max(12).optional(),
      })
      .strict()
      .nullable()
      .optional(),
    /** Localized footer copy (social URLs and the badge stay global). */
    footer: z
      .object({
        copyright: z.string().max(200).optional(),
      })
      .strict()
      .nullable()
      .optional(),
    /** Localized announcement banner. */
    banner: z
      .object({
        enabled: z.boolean().optional(),
        message: z.string().max(300).optional(),
        linkLabel: z.string().max(80).optional(),
        linkUrl: url.optional(),
        dismissible: z.boolean().optional(),
      })
      .strict()
      .nullable()
      .optional(),
    /** Localized search field copy (provider/hotkey/limits stay global). */
    search: z
      .object({
        placeholder: z.string().max(80).optional(),
      })
      .strict()
      .nullable()
      .optional(),
  })
  .strict();

export type LanguageConfig = z.infer<typeof languageConfigSchema>;

export const projectTranslationSchema = z
  .object({
    name: z.string().max(120).nullable().optional(),
    description: z.string().max(500).nullable().optional(),
  })
  .strict();

export type ProjectTranslationInput = z.infer<typeof projectTranslationSchema>;
