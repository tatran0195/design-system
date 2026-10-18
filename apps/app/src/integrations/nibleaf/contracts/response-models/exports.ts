import type { ExportFormatInput } from '@/integrations/nibleaf/contracts/validators/exports';
export type ExportFormat = ExportFormatInput;

export type ExportStatus = 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';

export interface ExportArtifact {
  id: string;
  format: ExportFormat;
  fileName: string;
  size: number;
}

export interface ExportRun {
  id: string;
  formats: ExportFormat[];
  status: ExportStatus;
  trigger: 'MANUAL' | 'SCHEDULED';
  attempts: number;
  error: string | null;
  createdAt: string;
  snapshot: { deploymentVersion: number; pagesCount: number; createdAt: string };
  artifacts: ExportArtifact[];
  schedule: { id: string; name: string } | null;
}

export interface ExportSchedule {
  id: string;
  name: string;
  formats: ExportFormat[];
  cadence: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  timezone: string;
  hour: number;
  minute: number;
  enabled: boolean;
  nextRunAt: string | null;
  lastError: string | null;
  retentionCount: number;
  retentionDays: number;
  _count: { jobs: number };
}
