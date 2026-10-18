import { z } from 'zod';

export const addDomainBody = z.object({
  domain: z
    .string()
    .trim()
    .toLowerCase()
    .transform((value) => value.replace(/\.$/, ''))
    .pipe(
      z
        .string()
        .min(3)
        .max(253)
        .regex(/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/, 'Enter a valid domain like docs.example.com'),
    ),
});

export type AddDomainBody = z.infer<typeof addDomainBody>;
