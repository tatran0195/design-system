/** Client-only JSON projections of the pinned Nibleaf HTTP responses.
 * No server, database or auth implementation is imported by this application. */
import type { RedirectValidationIssue } from '@/integrations/nibleaf/contracts/shared/redirects';
import type { AnalyticsRange, PendingChange } from '@/integrations/nibleaf/contracts/types';

export interface PublicMeta {
  providers: { google: boolean };
  signupDisabled: boolean;
}
export interface InvitationInfo {
  id: string;
  email: string;
  role: string;
  status: string;
  organizationName: string | null;
  expired: boolean;
}
export interface Member {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  createdAt: string;
  user: { id: string; name: string; email: string; image: string | null };
}
export interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  inviterId: string;
}
export interface MembersResult {
  members: Member[];
  invitations: Invitation[];
}
export interface PendingChanges {
  hasBaseline: boolean;
  lastVersion: number | null;
  lastPublishedAt: string | null;
  changes: PendingChange[];
  redirectIssues: RedirectValidationIssue[];
}
export interface PresignedUpload {
  key: string;
  uploadUrl: string;
}
export interface GitIdentity {
  login: string;
  name: string | null;
}
export interface GitWebhookSecret {
  webhookSecret: string;
}

interface AnalyticsSummary {
  availability: 'complete' | 'partial' | 'unavailable';
  range: AnalyticsRange;
  timezone: string;
  totalViews: number | null;
  uniqueVisitors: number | null;
  timeseries: Array<{ date: string; views: number }>;
  referrers: Array<{ referrer: string; views: number }>;
  devices: Array<{ device: string; count: number }>;
  ai: {
    answersCompleted: number | null;
    answersFailed: number | null;
    promptTokens: number | null;
    completionTokens: number | null;
    costMicros: number | null;
    averageLatencyMs: number | null;
  };
}
export interface ProjectAnalytics extends AnalyticsSummary {
  topPages: Array<{ path: string; views: number }>;
  topSearches: Array<{ query: string; count: number }>;
  languages: Array<{ language: string; views: number }>;
  engagement: { engagedViews: number | null; averageEngagementMs: number | null };
  searches: {
    total: number | null;
    zeroResults: number | null;
    clickedResults: number | null;
    averageLatencyMs: number | null;
    queryTerms: 'redacted' | 'legacy';
  };
  noAnswerReasons: Array<{ reason: string; count: number }>;
}
export interface WorkspaceAnalytics extends AnalyticsSummary {
  byProject: Array<{ projectId: string; name: string; color: string; views: number }>;
  topPages: Array<{ path: string; project: string; views: number }>;
  searches: { total: number | null; zeroResults?: number | null; clickedResults?: number | null; topTerms: Array<{ query: string; count: number }> };
}
