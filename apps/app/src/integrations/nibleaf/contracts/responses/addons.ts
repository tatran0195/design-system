/** Runtime wire response contracts. Schema output is checked against the DTO; no generic casts. */
import { z } from 'zod';
import type { AddonAvailabilityState, AddonGroup, AddonId } from '@/integrations/nibleaf/contracts/shared/addons';
export const addonIdSchema: z.ZodType<AddonId> = z.union([
  z.literal('feedback'),
  z.literal('edit-suggestions'),
  z.literal('issue-links'),
  z.literal('consent-banner'),
  z.literal('ci-checks'),
  z.literal('broken-links'),
  z.literal('grammar-linter'),
  z.literal('preview-deployments'),
]);
export const addonGroupSchema: z.ZodType<AddonGroup> = z.union([z.literal('engagement'), z.literal('privacy'), z.literal('publishing')]);
export const addonAvailabilityStateSchema: z.ZodType<AddonAvailabilityState> = z.union([
  z.literal('available'),
  z.literal('preview'),
  z.literal('coming_soon'),
]);
