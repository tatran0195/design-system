import { z } from 'zod';
/** Better Auth's raw session envelope; dates are normalized like the client SDK. */
export const sessionSchema = z.object({
  user: z.object({
    id: z.string().min(1),
    name: z.string(),
    email: z.email(),
    emailVerified: z.boolean(),
    image: z.string().nullish(),
    role: z.string().optional(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  }),
  session: z.object({
    id: z.string().min(1),
    token: z.string(),
    userId: z.string().min(1),
    activeOrganizationId: z.string().nullish(),
    impersonatedBy: z.string().nullish(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    expiresAt: z.coerce.date(),
  }),
});
