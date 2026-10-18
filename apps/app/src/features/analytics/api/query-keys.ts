import type { AnalyticsRange } from '@/integrations/nibleaf/contracts/validators/analytics';

export const analyticsQueryKeys = {
  project: (projectId: string, range: AnalyticsRange, timezone: string) => ['analytics', 'project', projectId, range, timezone] as const,
  workspace: (range: AnalyticsRange, timezone: string) => ['analytics', 'workspace', range, timezone] as const,
};
