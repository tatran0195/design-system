import { z } from 'zod';
import { projectConfigUpdateSchema } from './project-config';
export const createProjectBody = z
  .object({
    name: z.string().min(1).max(120),
    description: z.string().max(500).optional(),
    icon: z.string().max(64).optional(),
  })
  .strict();

export type CreateProjectBody = z.infer<typeof createProjectBody>;

export const updateProjectBody = z
  .object({
    name: z.string().min(1).max(120).optional(),
    slug: z
      .string()
      .min(1)
      .max(63)
      .regex(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/, 'Use lowercase letters, numbers, and hyphens.')
      .optional(),
    description: z.string().max(500).nullable().optional(),
    icon: z.string().max(64).nullable().optional(),
    config: projectConfigUpdateSchema.optional(),
  })
  .strict();

export type UpdateProjectBody = z.infer<typeof updateProjectBody>;

export const repositoryFilePath = z
  .string()
  .min(1)
  .max(500)
  .refine((value) => {
    const slashPath = value.trim().replace(/\\/g, '/');
    const parts = slashPath.split('/').filter(Boolean);
    return !slashPath.startsWith('/') && !/^[A-Za-z]:/.test(slashPath) && parts.every((part) => part !== '.' && part !== '..');
  }, 'OpenAPI file path must stay inside the repository.');
