/** Runtime wire response contracts. Schema output is checked against the DTO; no generic casts. */
import { z } from 'zod';
import type { ExportArtifact, ExportFormat, ExportRun, ExportSchedule, ExportStatus } from '@/integrations/nibleaf/contracts/response-models/exports';
import { exportFormat } from '../validators/exports';
export const exportRunSchema: z.ZodType<ExportRun> = z.object({
  id: z.string(),
  formats: z.array(z.lazy(() => exportFormatSchema)),
  status: z.lazy(() => exportStatusSchema),
  trigger: z.union([z.literal('MANUAL'), z.literal('SCHEDULED')]),
  attempts: z.number(),
  error: z.union([z.string(), z.null()]),
  createdAt: z.string(),
  snapshot: z.object({ deploymentVersion: z.number(), pagesCount: z.number(), createdAt: z.string() }),
  artifacts: z.array(z.lazy(() => exportArtifactSchema)),
  schedule: z.union([z.object({ id: z.string(), name: z.string() }), z.null()]),
});
export const exportScheduleSchema: z.ZodType<ExportSchedule> = z.object({
  id: z.string(),
  name: z.string(),
  formats: z.array(z.lazy(() => exportFormatSchema)),
  cadence: z.union([z.literal('DAILY'), z.literal('WEEKLY'), z.literal('MONTHLY')]),
  timezone: z.string(),
  hour: z.number(),
  minute: z.number(),
  enabled: z.boolean(),
  nextRunAt: z.union([z.string(), z.null()]),
  lastError: z.union([z.string(), z.null()]),
  retentionCount: z.number(),
  retentionDays: z.number(),
  _count: z.object({ jobs: z.number() }),
});
export const exportFormatSchema: z.ZodType<ExportFormat> = exportFormat;
export const exportStatusSchema: z.ZodType<ExportStatus> = z.union([
  z.literal('PENDING'),
  z.literal('RUNNING'),
  z.literal('SUCCEEDED'),
  z.literal('FAILED'),
  z.literal('CANCELLED'),
]);
export const exportArtifactSchema: z.ZodType<ExportArtifact> = z.object({
  id: z.string(),
  format: z.lazy(() => exportFormatSchema),
  fileName: z.string(),
  size: z.number(),
});
