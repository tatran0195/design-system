import { z } from 'zod';

export const exportFormat = z.enum(['MARKDOWN', 'PDF', 'STATIC_HTML']);

export type ExportFormatInput = z.infer<typeof exportFormat>;

export const createExportBody = z
  .object({
    formats: z
      .array(exportFormat)
      .min(1)
      .max(3)
      .transform((formats) => [...new Set(formats)]),
  })
  .strict();

export type CreateExportBody = z.infer<typeof createExportBody>;

export const createExportScheduleBody = z
  .object({
    name: z.string().trim().min(1).max(80),
    formats: z
      .array(exportFormat)
      .min(1)
      .max(3)
      .transform((formats) => [...new Set(formats)]),
    cadence: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
    timezone: z
      .string()
      .min(1)
      .max(80)
      .refine((timezone) => {
        try {
          new Intl.DateTimeFormat('en', { timeZone: timezone }).format();
          return true;
        } catch {
          return false;
        }
      }, 'Use a valid IANA timezone, for example Africa/Lagos.'),
    hour: z.number().int().min(0).max(23),
    minute: z.number().int().min(0).max(59),
    weekday: z.number().int().min(0).max(6).optional(),
    monthday: z.number().int().min(1).max(31).optional(),
    retentionCount: z.number().int().min(1).max(100).default(12),
    retentionDays: z.number().int().min(1).max(3650).default(90),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.cadence === 'WEEKLY' && value.weekday === undefined) {
      ctx.addIssue({ code: 'custom', path: ['weekday'], message: 'weekday is required for weekly schedules.' });
    }
    if (value.cadence === 'MONTHLY' && value.monthday === undefined) {
      ctx.addIssue({ code: 'custom', path: ['monthday'], message: 'monthday is required for monthly schedules.' });
    }
  });

export type CreateExportScheduleBody = z.infer<typeof createExportScheduleBody>;

export const updateExportScheduleBody = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    enabled: z.boolean().optional(),
    retentionCount: z.number().int().min(1).max(100).optional(),
    retentionDays: z.number().int().min(1).max(3650).optional(),
  })
  .strict();

export type UpdateExportScheduleBody = z.infer<typeof updateExportScheduleBody>;

export const adminSetRoleBody = z.object({ role: z.enum(['user', 'admin']) }).strict();

export type AdminSetRoleBody = z.infer<typeof adminSetRoleBody>;

export const mintlifyImportBody = z
  .object({
    repo: z
      .string()
      .max(120)
      .regex(/^[\w.-]+\/[\w.-]+$/, 'Use the form owner/repo.'),
    branch: z.string().max(120).optional(),
    replaceExisting: z.boolean().optional(),
  })
  .strict();

export type MintlifyImportBody = z.infer<typeof mintlifyImportBody>;

export const ghostImportBody = z.record(z.string(), z.unknown());

export type GhostImportBody = z.infer<typeof ghostImportBody>;
