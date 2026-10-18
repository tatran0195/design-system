/** Runtime wire response contracts. Schema output is checked against the DTO; no generic casts. */
import { z } from 'zod';
import type { ApiKey, ApiKeySecret } from '@/integrations/nibleaf/contracts/types';
export const apiKeySchema: z.ZodType<ApiKey> = z.object({
  id: z.string(),
  name: z.string(),
  lastFour: z.string(),
  scopes: z.array(z.string()),
  createdAt: z.string(),
  lastUsedAt: z.union([z.string(), z.null()]),
  expiresAt: z.union([z.string(), z.null()]),
  revokedAt: z.union([z.string(), z.null()]),
  rotatedFromId: z.union([z.string(), z.null()]),
  legacy: z.boolean(),
  state: z.union([z.literal('active'), z.literal('expired'), z.literal('revoked'), z.literal('rotation_required')]),
});
export const apiKeySecretSchema: z.ZodType<ApiKeySecret> = z.object({
  id: z.string(),
  name: z.string(),
  lastFour: z.string(),
  scopes: z.array(z.string()),
  createdAt: z.string(),
  lastUsedAt: z.union([z.string(), z.null()]),
  expiresAt: z.union([z.string(), z.null()]),
  revokedAt: z.union([z.string(), z.null()]),
  rotatedFromId: z.union([z.string(), z.null()]),
  legacy: z.boolean(),
  state: z.union([z.literal('active'), z.literal('expired'), z.literal('revoked'), z.literal('rotation_required')]),
  secret: z.string(),
});
