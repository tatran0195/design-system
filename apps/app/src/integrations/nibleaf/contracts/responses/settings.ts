/** Runtime wire response contracts. Schema output is checked against the DTO; no generic casts. */
import { z } from 'zod';
import type { Domain, OpenApiConfiguration, ProjectAddon } from '@/integrations/nibleaf/contracts/types';
import { addonAvailabilityStateSchema, addonGroupSchema, addonIdSchema } from './addons';
import { safeUrlSchema } from './url';
export const openApiConfigurationSchema: z.ZodType<OpenApiConfiguration> = z.object({
  title: z.string(),
  path: z.string(),
  contentHash: z.string(),
  updatedAt: z.string(),
  source: z.union([
    z.object({ type: z.literal('upload') }),
    z.object({ type: z.literal('url'), url: safeUrlSchema }),
    z.object({ type: z.literal('repository'), path: z.string() }),
  ]),
});
export const domainSchema: z.ZodType<Domain> = z.object({
  id: z.string(),
  domain: z.string(),
  verified: z.boolean(),
  isPrimary: z.boolean(),
  dnsStatus: z.union([z.literal('PENDING'), z.literal('VERIFIED'), z.literal('ERROR')]),
  sslStatus: z.union([z.literal('PENDING'), z.literal('PROVISIONING'), z.literal('ACTIVE'), z.literal('ERROR')]),
  verificationToken: z.string(),
  createdAt: z.string(),
  verifiedAt: z.union([z.string(), z.null()]),
  lastCheckedAt: z.union([z.string(), z.null()]),
  lastError: z.union([z.string(), z.null()]),
  records: z.array(z.lazy(() => dnsRecordSchema)).optional(),
});
export const projectAddonSchema: z.ZodType<ProjectAddon> = z.object({
  id: z.lazy(() => addonIdSchema),
  group: z.lazy(() => addonGroupSchema),
  enabled: z.boolean(),
  config: z.record(z.string(), z.unknown()),
  revision: z.number(),
  updatedAt: z.union([z.string(), z.null()]),
  status: z.union([z.literal('active'), z.literal('inactive'), z.literal('needs_configuration'), z.literal('unavailable')]),
  availability: z.object({
    state: z.lazy(() => addonAvailabilityStateSchema),
    plans: z.array(z.string()),
    entitlement: z.enum([
      'addons.feedback',
      'addons.edit-suggestions',
      'addons.issue-links',
      'addons.consent-banner',
      'addons.ci-checks',
      'addons.broken-links',
      'addons.grammar-linter',
      'addons.preview-deployments',
    ]),
    available: z.boolean(),
    schemaVersion: z.literal(1),
    projectId: z.string(),
    capabilityKey: z.string(),
    availability: z.union([z.literal('complete'), z.literal('unavailable')]),
    decision: z.union([z.literal('enabled'), z.literal('disabled'), z.literal('unknown')]),
    planKey: z.union([z.string(), z.null()]),
    source: z.union([z.literal('plan'), z.literal('compatibility'), z.null()]),
    limit: z.union([z.string(), z.null()]),
    meterKey: z.union([z.string(), z.null()]),
    behavior: z.union([z.literal('observe'), z.literal('warn'), z.literal('block')]),
    enforcement: z.literal('advisory'),
  }),
});
export const dnsRecordSchema = z.object({ type: z.string(), name: z.string(), value: z.string(), ttl: z.number() });
