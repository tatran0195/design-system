import { z } from 'zod';
import { MCP_SCOPES } from '@/integrations/nibleaf/contracts/shared/mcp';

export const apiKeyScopes = z
  .array(z.enum(MCP_SCOPES))
  .min(1)
  .max(MCP_SCOPES.length)
  .transform((scopes) => [...new Set(scopes)])
  .refine((scopes) => scopes.includes('mcp:connect'), { message: 'MCP API keys require mcp:connect.' });

export const apiKeyExpiryDays = z.number().int().min(1).max(365);

export const createApiKeyBody = z.object({
  name: z.string().min(1).max(80),
  scopes: apiKeyScopes.default(['mcp:connect', 'projects:read', 'pages:read']),
  expiresInDays: apiKeyExpiryDays.default(90),
});

export type CreateApiKeyBody = z.infer<typeof createApiKeyBody>;

export const rotateApiKeyBody = z.object({ scopes: apiKeyScopes, expiresInDays: apiKeyExpiryDays });

export type RotateApiKeyBody = z.infer<typeof rotateApiKeyBody>;
