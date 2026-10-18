/** Runtime wire response contracts. Schema output is checked against the DTO; no generic casts. */
import { z } from 'zod';
import type { ReaderAccessData } from '@/integrations/nibleaf/contracts/response-models/reader-access';
export const readerAccessDataSchema: z.ZodType<ReaderAccessData> = z.object({
  accessMode: z.union([z.literal('PUBLIC'), z.literal('WORKSPACE'), z.literal('READERS')]),
  readers: z.array(
    z.object({
      id: z.string(),
      email: z.union([z.string(), z.null()]),
      name: z.union([z.string(), z.null()]),
      status: z.string(),
      audiences: z.array(z.object({ audience: z.object({ id: z.string(), name: z.string() }) })),
      _count: z.object({ sessions: z.number() }),
    }),
  ),
  audiences: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      grants: z.array(z.object({ pageId: z.union([z.string(), z.null()]) })),
      _count: z.object({ readers: z.number() }),
    }),
  ),
  jwt: z.union([
    z.object({
      enabled: z.boolean(),
      issuer: z.string(),
      audience: z.string(),
      jwksUrl: z.union([z.string(), z.null()]),
      publicJwks: z.unknown(),
      groupsClaim: z.string(),
      claimMapping: z.unknown(),
      sessionTtlMinutes: z.number(),
      maxTokenAgeSeconds: z.number(),
      clockToleranceSecs: z.number(),
    }),
    z.null(),
  ]),
  audit: z.array(z.object({ id: z.string(), action: z.string(), createdAt: z.string() })),
});
