import { z } from 'zod';
export const projectAccessModeBody = z.object({ mode: z.enum(['PUBLIC', 'WORKSPACE', 'READERS']) }).strict();

export type ProjectAccessModeBody = z.infer<typeof projectAccessModeBody>;

export const createAudienceBody = z
  .object({
    name: z.string().trim().min(1).max(80),
    description: z.string().trim().max(500).optional(),
    /** Empty/null page scope means the entire site. */
    pageIds: z.array(z.string().min(1)).max(500).optional(),
  })
  .strict();

export type CreateAudienceBody = z.infer<typeof createAudienceBody>;

export const updateAudienceBody = createAudienceBody.partial();

export type UpdateAudienceBody = z.infer<typeof updateAudienceBody>;

export const inviteReaderBody = z
  .object({
    email: z.string().trim().toLowerCase().email().max(320),
    name: z.string().trim().min(1).max(120).optional(),
    audienceIds: z.array(z.string().min(1)).min(1).max(100),
  })
  .strict();

export type InviteReaderBody = z.infer<typeof inviteReaderBody>;

export const updateReaderBody = z
  .object({
    name: z.string().trim().min(1).max(120).nullable().optional(),
    audienceIds: z.array(z.string().min(1)).min(1).max(100).optional(),
  })
  .strict();

export type UpdateReaderBody = z.infer<typeof updateReaderBody>;

export const publicJwk = z
  .object({
    kty: z.string().min(1),
    kid: z.string().min(1).optional(),
    use: z.string().optional(),
    alg: z.string().optional(),
  })
  .passthrough()
  .refine((key) => !['d', 'p', 'q', 'dp', 'dq', 'qi', 'oth', 'priv', 'k'].some((field) => field in key), 'JWKS must contain public keys only');

export const jwtAccessConfigBody = z
  .object({
    enabled: z.boolean(),
    issuer: z.string().trim().url().max(2048),
    audience: z.string().trim().min(1).max(500),
    jwksUrl: z.string().trim().url().max(2048).nullable().optional(),
    publicJwks: z
      .object({ keys: z.array(publicJwk).min(1).max(20) })
      .strict()
      .nullable()
      .optional(),
    subjectClaim: z
      .string()
      .regex(/^[A-Za-z0-9_.-]{1,80}$/)
      .default('sub'),
    emailClaim: z
      .string()
      .regex(/^[A-Za-z0-9_.-]{1,80}$/)
      .default('email'),
    nameClaim: z
      .string()
      .regex(/^[A-Za-z0-9_.-]{1,80}$/)
      .default('name'),
    groupsClaim: z
      .string()
      .regex(/^[A-Za-z0-9_.-]{1,80}$/)
      .default('groups'),
    /** Maps an IdP claim value to an audience id. */
    claimMapping: z.record(z.string().min(1).max(200), z.string().min(1)).default({}),
    sessionTtlMinutes: z.number().int().min(5).max(43_200).default(480),
    maxTokenAgeSeconds: z.number().int().min(30).max(3600).default(300),
    clockToleranceSecs: z.number().int().min(0).max(300).default(30),
  })
  .strict()
  .refine((value) => Boolean(value.jwksUrl) !== Boolean(value.publicJwks), 'Provide exactly one of jwksUrl or publicJwks')
  .refine((value) => !value.jwksUrl || new URL(value.jwksUrl).protocol === 'https:', 'JWKS URL must use HTTPS');

export type JwtAccessConfigBody = z.infer<typeof jwtAccessConfigBody>;

export const readerActivationQuery = z.object({ token: z.string().min(32).max(512) }).strict();

export const readerJwtHandoffBody = z.object({ token: z.string().min(32).max(32_768), redirect: z.string().max(2048).optional() }).strict();

export const commentAnchor = z
  .object({
    quote: z.string().max(2000),
    from: z.number().int().nonnegative().optional(),
    to: z.number().int().nonnegative().optional(),
  })
  .strict();

export type CommentAnchor = z.infer<typeof commentAnchor>;

export const createCommentBody = z.object({
  body: z.string().min(1).max(4000),
  pageId: z.string().nullable().optional(),
  anchor: commentAnchor.nullable().optional(),
});

export type CreateCommentBody = z.infer<typeof createCommentBody>;

export const resolveCommentBody = z.object({ resolved: z.boolean() });

export type ResolveCommentBody = z.infer<typeof resolveCommentBody>;
