import { z } from 'zod';

export const analyticsRangeEnum = z.enum(['24h', '7d', '30d', '90d']);

export type AnalyticsRange = z.infer<typeof analyticsRangeEnum>;

export const analyticsQuery = z.object({
  range: analyticsRangeEnum.default('7d'),
  timezone: z.string().trim().min(1).max(64).default('UTC'),
});

export type AnalyticsQuery = z.infer<typeof analyticsQuery>;

export const trackEventBody = z.object({
  type: z.enum(['pageview', 'search', 'feedback']).default('pageview'),
  path: z.string().max(512).optional(),
  referrer: z.string().max(512).optional(),
  query: z.string().max(200).optional(),
  sessionId: z.string().max(64).optional(),
  language: z.string().max(35).optional(),
});

export type TrackEventBody = z.infer<typeof trackEventBody>;
