import { z } from 'zod';
import { themeConfigSchema } from '@/integrations/nibleaf/contracts/validators/themes';
import { hexColor, kvPair, navAnchor, navLink, redirectsSchema, SEARCH_MAX_RESULTS, url } from './search';
export const projectConfigSchema = z
  .object({
    visibility: z.enum(['public', 'private']).optional(),
    branding: z
      .object({
        logoLight: url.nullable().optional(),
        logoDark: url.nullable().optional(),
        favicon: url.nullable().optional(),
        logoHref: url.nullable().optional(),
      })
      .strict()
      .optional(),
    styling: z
      .object({
        primaryColor: hexColor.optional(),
        theme: z.enum(['light', 'dark', 'system']).optional(),
        radius: z.enum(['sharp', 'rounded', 'pill']).optional(),
      })
      .strict()
      .optional(),
    theme: themeConfigSchema.optional(),
    typography: z
      .object({
        headingFont: z.string().max(60).optional(),
        bodyFont: z.string().max(60).optional(),
        codeFont: z.string().max(60).optional(),
        baseSize: z.enum(['14', '15', '16', '17', '18']).optional(),
        // Reading rhythm (shadcn typeset): line height and block spacing for
        // rendered doc content. Discrete steps keep every combination readable.
        leading: z.enum(['1.5', '1.6', '1.75', '1.9', '2']).optional(),
        flow: z.enum(['0.75', '1', '1.25', '1.5', '2']).optional(),
      })
      .strict()
      .optional(),
    navbar: z
      .object({
        ctaLabel: z.string().max(60).optional(),
        ctaUrl: url.optional(),
        links: z.array(navLink).max(20).optional(),
        // Top-level tabs (a secondary nav row) and pinned sidebar anchors —
        // Mintlify-style IA primitives for larger docs.
        tabs: z.array(navLink).max(10).optional(),
        anchors: z.array(navAnchor).max(12).optional(),
        showSearch: z.boolean().optional(),
        // Opt-in built-in "Changelog" navbar link (localized label, links to the
        // auto-generated releases page). Off by default — not every product
        // wants a public changelog.
        changelog: z.boolean().optional(),
      })
      .strict()
      .optional(),
    footer: z
      .object({
        copyright: z.string().max(200).optional(),
        github: url.optional(),
        x: url.optional(),
        linkedin: url.optional(),
        // "Made with Nibleaf" badge on published sites — default ON; explicit
        // false hides it (free during beta; may become a paid perk later).
        madeWithBadge: z.boolean().optional(),
      })
      .strict()
      .optional(),
    banner: z
      .object({
        enabled: z.boolean().optional(),
        message: z.string().max(300).optional(),
        linkLabel: z.string().max(80).optional(),
        linkUrl: url.optional(),
        dismissible: z.boolean().optional(),
      })
      .strict()
      .optional(),
    seo: z
      .object({
        metaTitle: z.string().max(160).optional(),
        metaDescription: z.string().max(320).optional(),
        socialImage: url.optional(),
        allowIndex: z.boolean().optional(),
      })
      .strict()
      .optional(),
    search: z
      .object({
        provider: z.enum(['builtin', 'algolia', 'typesense']).optional(),
        placeholder: z.string().max(80).optional(),
        hotkey: z.enum(['cmdk', 'slash']).optional(),
        maxResults: z.number().int().min(SEARCH_MAX_RESULTS.min).max(SEARCH_MAX_RESULTS.max).optional(),
        filtersEnabled: z.boolean().optional(),
        versionFilterEnabled: z.boolean().optional(),
        aiAnswers: z.boolean().optional(),
      })
      .strict()
      .optional(),
    addons: z
      .object({
        feedback: z.boolean().optional(),
        feedbackPlacement: z.enum(['after-content', 'after-navigation']).optional(),
        feedbackPresentation: z.enum(['compact', 'card']).optional(),
        editSuggestions: z.boolean().optional(),
        issueLinks: z.boolean().optional(),
        ciChecks: z.boolean().optional(),
        brokenLinks: z.boolean().optional(),
        grammarLinter: z.boolean().optional(),
        previewDeployments: z.boolean().optional(),
        editUrl: z.string().max(500).optional(),
        issueUrl: z.string().max(500).optional(),
        consentBanner: z
          .object({
            enabled: z.boolean(),
            placement: z.enum(['bottom-start', 'bottom-center', 'bottom-end']),
            presentation: z.enum(['compact', 'comfortable']),
            buttonLayout: z.enum(['inline', 'stacked']),
          })
          .strict()
          .optional(),
      })
      .strict()
      .optional(),
    analytics: z
      .object({
        ga4: z.string().max(40).optional(),
        plausible: z.string().max(120).optional(),
        cookieConsent: z.boolean().optional(),
        /** Built-in analytics remains content-minimized. Campaign dimensions
         * and raw public search terms each require an explicit project opt-in. */
        campaignDimensions: z.boolean().optional(),
        storePublicSearchTerms: z.boolean().optional(),
      })
      .strict()
      .optional(),
    redirects: redirectsSchema.optional(),
    variables: z.array(kvPair).max(100).optional(),
  })
  .strict();

export type ProjectConfig = z.infer<typeof projectConfigSchema>;

export const projectConfigUpdateSchema = projectConfigSchema.omit({ addons: true }).extend({
  analytics: projectConfigSchema.shape.analytics.unwrap().omit({ cookieConsent: true }).optional(),
});

export type ProjectConfigUpdate = z.infer<typeof projectConfigUpdateSchema>;
