/** Runtime wire response contracts. Schema output is checked against the DTO; no generic casts. */
import { z } from 'zod';
import type { ProjectAnalytics, WorkspaceAnalytics } from '@/integrations/nibleaf/contracts/response-types';
import { analyticsRangeEnum } from '../validators/analytics';
export const projectAnalyticsSchema: z.ZodType<ProjectAnalytics> = z.object({
  availability: z.union([z.literal('complete'), z.literal('partial'), z.literal('unavailable')]),
  range: analyticsRangeEnum,
  timezone: z.string(),
  totalViews: z.union([z.number(), z.null()]),
  uniqueVisitors: z.union([z.number(), z.null()]),
  timeseries: z.array(z.object({ date: z.string(), views: z.number() })),
  referrers: z.array(z.object({ referrer: z.string(), views: z.number() })),
  devices: z.array(z.object({ device: z.string(), count: z.number() })),
  ai: z.object({
    answersCompleted: z.union([z.number(), z.null()]),
    answersFailed: z.union([z.number(), z.null()]),
    promptTokens: z.union([z.number(), z.null()]),
    completionTokens: z.union([z.number(), z.null()]),
    costMicros: z.union([z.number(), z.null()]),
    averageLatencyMs: z.union([z.number(), z.null()]),
  }),
  topPages: z.array(z.object({ path: z.string(), views: z.number() })),
  topSearches: z.array(z.object({ query: z.string(), count: z.number() })),
  languages: z.array(z.object({ language: z.string(), views: z.number() })),
  engagement: z.object({ engagedViews: z.union([z.number(), z.null()]), averageEngagementMs: z.union([z.number(), z.null()]) }),
  searches: z.object({
    total: z.union([z.number(), z.null()]),
    zeroResults: z.union([z.number(), z.null()]),
    clickedResults: z.union([z.number(), z.null()]),
    averageLatencyMs: z.union([z.number(), z.null()]),
    queryTerms: z.union([z.literal('redacted'), z.literal('legacy')]),
  }),
  noAnswerReasons: z.array(z.object({ reason: z.string(), count: z.number() })),
});
export const workspaceAnalyticsSchema: z.ZodType<WorkspaceAnalytics> = z.object({
  availability: z.union([z.literal('complete'), z.literal('partial'), z.literal('unavailable')]),
  range: analyticsRangeEnum,
  timezone: z.string(),
  totalViews: z.union([z.number(), z.null()]),
  uniqueVisitors: z.union([z.number(), z.null()]),
  timeseries: z.array(z.object({ date: z.string(), views: z.number() })),
  referrers: z.array(z.object({ referrer: z.string(), views: z.number() })),
  devices: z.array(z.object({ device: z.string(), count: z.number() })),
  ai: z.object({
    answersCompleted: z.union([z.number(), z.null()]),
    answersFailed: z.union([z.number(), z.null()]),
    promptTokens: z.union([z.number(), z.null()]),
    completionTokens: z.union([z.number(), z.null()]),
    costMicros: z.union([z.number(), z.null()]),
    averageLatencyMs: z.union([z.number(), z.null()]),
  }),
  byProject: z.array(z.object({ projectId: z.string(), name: z.string(), color: z.string(), views: z.number() })),
  topPages: z.array(z.object({ path: z.string(), project: z.string(), views: z.number() })),
  searches: z.object({
    total: z.union([z.number(), z.null()]),
    zeroResults: z.union([z.number(), z.null()]).optional(),
    clickedResults: z.union([z.number(), z.null()]).optional(),
    topTerms: z.array(z.object({ query: z.string(), count: z.number() })),
  }),
});
