/** Runtime wire response contracts. Schema output is checked against the DTO; no generic casts. */
import { z } from 'zod';
import type { Project, WorkspaceSettings } from '@/integrations/nibleaf/contracts/types';
import { projectConfigSchema } from '../validators/project-config';
import { languageSchema } from './content';
export const projectSchema: z.ZodType<Project> = z.object({
  id: z.string(),
  organizationId: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.union([z.string(), z.null()]),
  icon: z.union([z.string(), z.null()]),
  config: z.union([projectConfigSchema.passthrough(), z.null()]),
  languages: z.array(z.lazy(() => languageSchema)).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  _count: z.object({ pages: z.number(), deployments: z.number(), domains: z.number().optional() }).optional(),
});
export const workspaceSettingsSchema: z.ZodType<WorkspaceSettings> = z
  .object({
    plan: z.string(),
    notifications: z.record(z.string(), z.boolean()),
    integrations: z.record(z.string(), z.unknown()),
    git: z.record(z.string(), z.unknown()),
    name: z.string(),
    slug: z.union([z.string(), z.null()]),
    projectCount: z.number(),
    memberCount: z.number(),
  })
  .catchall(z.unknown());
