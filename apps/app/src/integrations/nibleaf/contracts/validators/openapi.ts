import { z } from 'zod';
import { repositoryFilePath } from './projects';
export const openApiSourceSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('upload'), content: z.string().min(1).max(5_000_000) }).strict(),
  z
    .object({
      type: z.literal('url'),
      url: z
        .url()
        .max(1000)
        .refine((value) => ['http:', 'https:'].includes(new URL(value).protocol), 'OpenAPI URL must use http(s).')
        .refine((value) => {
          const parsed = new URL(value);
          return !(parsed.username || parsed.password);
        }, 'OpenAPI URL must not include embedded credentials.'),
    })
    .strict(),
  z.object({ type: z.literal('repository'), path: repositoryFilePath }).strict(),
]);

export type OpenApiSourceInput = z.infer<typeof openApiSourceSchema>;

export const upsertOpenApiBody = z
  .object({
    title: z.string().trim().min(1).max(120),
    path: z
      .string()
      .trim()
      .min(1)
      .max(80)
      .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, 'Use lowercase letters, numbers, and hyphens.'),
    source: openApiSourceSchema.optional(),
  })
  .strict();

export type UpsertOpenApiBody = z.infer<typeof upsertOpenApiBody>;
