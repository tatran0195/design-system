/** Runtime wire response contracts. Schema output is checked against the DTO; no generic casts. */
import { z } from 'zod';
import type {
  IntegrationCapability,
  IntegrationCatalogEntry,
  IntegrationCategory,
  IntegrationConnectionSummary,
  IntegrationNavigation,
  IntegrationProviderId,
  IntegrationPublicConfig,
  IntegrationSettingsSection,
} from '@/integrations/nibleaf/contracts/shared/integrations';
export const integrationCatalogEntrySchema: z.ZodType<IntegrationCatalogEntry> = z.object({
  id: z.lazy(() => integrationProviderIdSchema),
  category: z.lazy(() => integrationCategorySchema),
  capabilities: z.array(z.lazy(() => integrationCapabilitySchema)),
  ownership: z.union([z.literal('project'), z.literal('instance')]),
  authKind: z.union([z.literal('none'), z.literal('secret'), z.literal('managed')]),
  lifecycle: z.union([z.literal('configurable'), z.literal('adapter'), z.literal('managed')]),
  supportsActivation: z.boolean(),
  supportsCredentialFreeUpdate: z.boolean(),
  supportsDelete: z.boolean(),
  supportsPassiveVerification: z.boolean(),
  verificationSideEffect: z.boolean(),
  navigation: z.lazy(() => integrationNavigationSchema),
  configFields: z.array(
    z.object({
      key: z.string(),
      kind: z.union([z.literal('text'), z.literal('url'), z.literal('secret')]),
      required: z.boolean(),
      secret: z.boolean(),
    }),
  ),
  availability: z.union([z.literal('available'), z.literal('not_configured'), z.literal('unavailable')]),
  connection: z.union([z.lazy(() => integrationConnectionSummarySchema), z.null()]),
});
export const integrationConnectionSummarySchema: z.ZodType<IntegrationConnectionSummary> = z.object({
  id: z.string(),
  providerId: z.lazy(() => integrationProviderIdSchema),
  category: z.lazy(() => integrationCategorySchema),
  ownership: z.union([z.literal('project'), z.literal('instance')]),
  status: z.union([z.literal('active'), z.literal('inactive'), z.literal('error')]),
  health: z.object({
    status: z.union([z.literal('unverified'), z.literal('healthy'), z.literal('unhealthy')]),
    checkedAt: z.union([z.string(), z.null()]),
    code: z.union([z.string(), z.null()]),
  }),
  credential: z.union([z.object({ configured: z.boolean() }), z.null()]),
  config: z.lazy(() => integrationPublicConfigSchema),
  revision: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export const integrationProviderIdSchema: z.ZodType<IntegrationProviderId> = z.union([
  z.literal('github'),
  z.literal('gitlab'),
  z.literal('public-git'),
  z.literal('google-analytics'),
  z.literal('plausible'),
  z.literal('slack'),
  z.literal('discord'),
  z.literal('zapier'),
  z.literal('openrouter'),
  z.literal('qdrant'),
  z.literal('clickhouse'),
  z.literal('postmark'),
  z.literal('smtp'),
  z.literal('maxio'),
  z.literal('minio'),
  z.literal('amazon-s3'),
  z.literal('cloudflare-r2'),
  z.literal('backblaze-b2'),
  z.literal('cloudflare'),
]);
export const integrationCategorySchema: z.ZodType<IntegrationCategory> = z.union([
  z.literal('source_control'),
  z.literal('deployment'),
  z.literal('ai'),
  z.literal('email'),
  z.literal('analytics'),
  z.literal('storage'),
  z.literal('webhook'),
]);
export const integrationCapabilitySchema: z.ZodType<IntegrationCapability> = z.union([
  z.literal('read'),
  z.literal('write'),
  z.literal('events'),
  z.literal('health'),
  z.literal('webhooks'),
  z.literal('content'),
  z.literal('deployments'),
  z.literal('generation'),
  z.literal('search'),
  z.literal('delivery'),
  z.literal('analytics'),
  z.literal('assets'),
]);
export const integrationNavigationSchema: z.ZodType<IntegrationNavigation> = z.object({
  settingsSection: z.union([z.lazy(() => integrationSettingsSectionSchema), z.null()]),
  documentation: z.object({ en: z.literal('/reference/integrations-engine'), ar: z.literal('/ar/reference/integrations-engine') }),
});
export const integrationPublicConfigSchema: z.ZodType<IntegrationPublicConfig> = z.union([
  z.object({ providerId: z.literal('github'), repository: z.string(), baseBranch: z.string(), headBranch: z.string(), contentPath: z.string() }),
  z.object({
    providerId: z.union([z.literal('gitlab'), z.literal('public-git')]),
    repository: z.string(),
    branch: z.string(),
    contentPath: z.string(),
  }),
  z.object({ providerId: z.literal('google-analytics'), measurementId: z.string() }),
  z.object({ providerId: z.literal('plausible'), domain: z.string() }),
  z.object({ providerId: z.union([z.literal('slack'), z.literal('discord'), z.literal('zapier')]), label: z.union([z.string(), z.null()]) }),
  z.object({ providerId: z.literal('openrouter'), draftModel: z.string(), embeddingModel: z.string(), answerModel: z.string() }),
  z.object({
    providerId: z.literal('qdrant'),
    collectionAlias: z.string(),
    searchRuntime: z.union([z.literal('legacy'), z.literal('shadow'), z.literal('hybrid')]),
  }),
  z.object({
    providerId: z.literal('clickhouse'),
    mode: z.union([z.literal('disabled'), z.literal('dual_write'), z.literal('shadow_read'), z.literal('clickhouse')]),
  }),
  z.object({ providerId: z.literal('postmark'), messageStream: z.union([z.string(), z.null()]) }),
  z.object({ providerId: z.literal('smtp') }),
  z.object({
    providerId: z.union([z.literal('maxio'), z.literal('minio'), z.literal('amazon-s3'), z.literal('cloudflare-r2'), z.literal('backblaze-b2')]),
  }),
  z.object({ providerId: z.literal('cloudflare'), workerScript: z.string() }),
]);
export const integrationSettingsSectionSchema: z.ZodType<IntegrationSettingsSection> = z.union([z.literal('git'), z.literal('integrations')]);
