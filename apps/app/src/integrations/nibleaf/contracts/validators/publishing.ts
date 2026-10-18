import { z } from 'zod';

export const createDeploymentBody = z.object({
  message: z.string().max(300).optional(),
});

export type CreateDeploymentBody = z.infer<typeof createDeploymentBody>;
