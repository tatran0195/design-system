import { z } from 'zod';
import { boundedRecord } from './comments';
export const gitConfigSchema = z.object({
  provider: z.enum(['github', 'gitlab', 'git']).optional(),
  repo: z
    .string()
    .max(120)
    .regex(/^[\w.-]+(?:\/[\w.-]+)+$/, 'Use the form owner/repo or group/project.')
    .optional(),
  cloneUrl: z
    .url()
    .max(500)
    .refine((value) => {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol) && !(url.username || url.password || url.search || url.hash);
    }, 'Clone URL must use http(s) without credentials, query parameters, or fragments.')
    .optional(),
  instanceUrl: z
    .url()
    .max(200)
    .refine((value) => {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol) && !(url.username || url.password || url.search || url.hash);
    }, 'GitLab instance URL must use http(s) without credentials, query parameters, or fragments.')
    .optional(),
  branch: z.string().max(120).optional(),
  path: z
    .string()
    .max(300)
    .refine((value) => {
      const slashPath = value.trim().replace(/\\/g, '/');
      const parts = slashPath.split('/').filter(Boolean);
      return !slashPath.startsWith('/') && !/^[A-Za-z]:/.test(slashPath) && parts.every((part) => part !== '.' && part !== '..');
    }, 'Content path must stay inside the repository.')
    .optional(),
  importBranchId: z.string().max(120).optional(),
  importLanguageId: z.string().max(120).optional(),
  connected: z.boolean().optional(),
  lastImportedAt: z.string().max(40).optional(),
  /** Publish a new deployment automatically after a push-webhook import. */
  autoPublish: z.boolean().optional(),
});

export type GitConfig = z.infer<typeof gitConfigSchema>;

export const updateWorkspaceSettingsBody = z
  .object({
    notifications: boundedRecord(z.boolean()).optional(),
    integrations: boundedRecord(z.unknown()).optional(),
    git: gitConfigSchema.optional(),
    plan: z.string().max(40).optional(),
  })
  .strict();

export type UpdateWorkspaceSettingsBody = z.infer<typeof updateWorkspaceSettingsBody>;

export const notificationsListQuery = z.object({ cursor: z.string().max(64).optional() });

export type NotificationsListQuery = z.infer<typeof notificationsListQuery>;

export const markNotificationsReadBody = z
  .object({
    ids: z.array(z.string().max(64)).max(100).optional(),
    all: z.boolean().optional(),
  })
  .strict()
  .refine((value) => value.all === true || (value.ids?.length ?? 0) > 0, { message: 'Provide notification ids or all: true.' });

export type MarkNotificationsReadBody = z.infer<typeof markNotificationsReadBody>;
