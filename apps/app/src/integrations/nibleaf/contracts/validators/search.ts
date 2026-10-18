import { z } from 'zod';
import { MAX_REDIRECT_RULES, validateRedirectGraph } from '@/integrations/nibleaf/contracts/shared/redirects';
import type { paginationQuery } from './common';
export type PaginationQuery = z.infer<typeof paginationQuery>;

export const hexColor = z.string().regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Must be a hex color like #5546e8');

export const url = z
  .string()
  .max(500)
  .refine((v) => !/^\s*(?:javascript|data|vbscript):/i.test(v), { message: 'Unsupported URL scheme.' });

export const navLink = z.object({ label: z.string().max(80), href: url, external: z.boolean().optional() }).strict();

export const navAnchor = z
  .object({ label: z.string().max(80), href: url, icon: z.string().max(40).optional(), external: z.boolean().optional() })
  .strict();

export const redirectsSchema = z
  .array(z.object({ from: z.string().max(300), to: z.string().max(300) }).strict())
  .max(MAX_REDIRECT_RULES)
  .superRefine((redirects, ctx) => {
    for (const graphIssue of validateRedirectGraph(redirects).issues) {
      const index = graphIssue.rowIndexes[0] ?? 0;
      ctx.addIssue({ code: 'custom', message: graphIssue.message, path: [index, graphIssue.field ?? 'to'] });
    }
  });

export const kvPair = z.object({ key: z.string().max(80), value: z.string().max(500) }).strict();

export const SEARCH_MAX_RESULTS = { default: 12, min: 1, max: 50 } as const;

export const searchConfigurationSchema = z
  .object({
    maxResults: z.number().int().min(SEARCH_MAX_RESULTS.min).max(SEARCH_MAX_RESULTS.max).default(SEARCH_MAX_RESULTS.default),
    filtersEnabled: z.boolean().default(true),
    versionFilterEnabled: z.boolean().default(true),
    aiAnswers: z.boolean().default(false),
    hotkey: z.enum(['cmdk', 'slash']).default('cmdk'),
    placeholder: z.string().trim().max(80).optional(),
  })
  .strict();

export type SearchConfiguration = z.infer<typeof searchConfigurationSchema>;

export const updateProjectSearchConfigurationBody = searchConfigurationSchema
  .omit({ placeholder: true })
  .partial()
  .extend({ placeholder: z.string().trim().max(80).nullable().optional() })
  .strict();

export type UpdateProjectSearchConfigurationBody = z.infer<typeof updateProjectSearchConfigurationBody>;

export const searchIndexDiagnosticsQuery = z
  .object({
    cursor: z.string().min(1).max(500).optional(),
    limit: z.coerce.number().int().min(1).max(25).default(10),
  })
  .strict();

export type SearchIndexDiagnosticsQuery = z.infer<typeof searchIndexDiagnosticsQuery>;

export const searchConfigurationResultSchema = z
  .object({
    configuration: searchConfigurationSchema.extend({ placeholder: z.string().nullable() }),
    constraints: z.object({ maxResults: z.object({ default: z.number(), min: z.number(), max: z.number() }).strict() }).strict(),
  })
  .strict();

export type SearchConfigurationResult = z.infer<typeof searchConfigurationResultSchema>;

export const searchIndexSampleSchema = z
  .object({
    pointId: z.string(),
    pageId: z.string(),
    ordinal: z.number().int().nonnegative(),
    language: z.string(),
    versionSlug: z.string(),
    status: z.enum(['indexed', 'stale', 'failed']),
    errorCode: z.string().max(80).optional(),
  })
  .strict();

export const searchIndexIssueSchema = searchIndexSampleSchema.omit({ pointId: true, status: true }).extend({
  status: z.enum(['stale', 'failed']),
});

export const searchIndexDiagnosticsResultSchema = z
  .object({
    availability: z
      .object({
        configured: z.boolean(),
        reason: z.enum(['not_configured', 'not_published', 'provider_unavailable']).nullable(),
      })
      .strict(),
    health: z.enum(['ready', 'indexing', 'stale', 'failed', 'empty', 'unavailable']),
    runtime: z.enum(['legacy', 'shadow', 'hybrid']),
    index: z
      .object({
        logicalId: z.string(),
        schemaVersion: z.string(),
        revisionId: z.string().nullable(),
        deploymentVersion: z.number().int().nullable(),
        embeddingModel: z.string(),
        vectorSize: z.number().int().positive(),
      })
      .strict(),
    corpus: z
      .object({
        chunks: z.number().int().nonnegative().nullable(),
        pages: z.number().int().nonnegative().nullable(),
        languages: z.array(z.object({ code: z.string(), count: z.number().int().nonnegative() }).strict()).max(100),
        versions: z.array(z.object({ slug: z.string(), count: z.number().int().nonnegative() }).strict()).max(100),
        distributionTruncated: z.object({ languages: z.boolean(), versions: z.boolean() }).strict(),
      })
      .strict(),
    latestRun: z
      .object({
        id: z.string(),
        status: z.enum(['PENDING', 'RUNNING', 'READY', 'FAILED', 'DISABLED']),
        startedAt: z.string().nullable(),
        completedAt: z.string().nullable(),
        counts: z
          .object({
            expected: z.number().int().nonnegative(),
            indexed: z.number().int().nonnegative(),
            embedded: z.number().int().nonnegative(),
            reused: z.number().int().nonnegative(),
            unchanged: z.number().int().nonnegative(),
            metadataUpdated: z.number().int().nonnegative(),
            deleted: z.number().int().nonnegative(),
            stale: z.number().int().nonnegative(),
            failed: z.number().int().nonnegative(),
          })
          .strict(),
        errorCode: z.string().nullable(),
      })
      .strict()
      .nullable(),
    samples: z.object({ items: z.array(searchIndexSampleSchema).max(25), nextCursor: z.string().nullable(), hasMore: z.boolean() }).strict(),
    issues: z
      .object({
        staleCount: z.number().int().nonnegative(),
        failedCount: z.number().int().nonnegative(),
        items: z.array(searchIndexIssueSchema).max(25),
      })
      .strict(),
  })
  .strict();

export type SearchIndexDiagnosticsResult = z.infer<typeof searchIndexDiagnosticsResultSchema>;
