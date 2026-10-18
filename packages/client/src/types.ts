// ─── Auth ────────────────────────────────────────────────────────────────────

export type AuthProviderId = 'github' | 'google' | 'cloud';

export interface LoginRequest {
  email: string;
  password: string;
  /** Inline MFA code (if user chose to provide it on first login attempt) */
  mfa_code?: string;
}

export interface SignUpRequest {
  full_name: string;
  email: string;
  password: string;
}

export interface VerifyMfaRequest {
  code: string;
  challenge_id: string;
  method?: 'totp' | 'recovery_code';
}

export interface RefreshTokenRequest {
  refresh_token?: string;
}

export interface MfaChallengeDTO {
  id: string;
  methods: Array<'totp' | 'recovery_code'>;
  email: string;
}

export interface UserInfo {
  id: string;
  tenant_id?: string;
  email: string;
  username?: string;
  full_name?: string;
  fullName?: string;
  avatar_url?: string;
  avatarUrl?: string;
  role?: string;
  email_verified?: boolean;
  mfa_enabled?: boolean;
}

export interface AuthResponse {
  token?: string;
  refresh_token?: string;
  user?: UserInfo;
  mfa_challenge?: MfaChallengeDTO;
  message?: string;
  permissions?: string[];
  site_ids?: string[];
}

// ─── Sites ───────────────────────────────────────────────────────────────────

export interface Site {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  custom_domain?: string;
  is_public: boolean;
  theme_config?: Record<string, unknown>;
  navigation_config?: unknown[];
  created_at: string;
  updated_at: string;
}

export interface CreateSiteRequest {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  custom_domain?: string;
  is_public?: boolean;
  theme_config?: Record<string, unknown>;
  navigation_config?: unknown[];
}

export interface UpdateSiteRequest {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  custom_domain?: string;
  is_public?: boolean;
  theme_config?: Record<string, unknown>;
  navigation_config?: unknown[];
}

// ─── Docs ────────────────────────────────────────────────────────────────────

export type DocPageStatus = 'draft' | 'published' | 'archived';

export interface DocPage {
  id: string;
  tenant_id: string;
  site_id: string;
  parent_id?: string;
  slug: string;
  title: string;
  content: string;
  status: DocPageStatus;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface CreateDocPageRequest {
  site_id: string;
  parent_id?: string;
  slug: string;
  title: string;
  content?: string;
  status?: DocPageStatus;
  order_index?: number;
}

export interface UpdateDocPageRequest {
  parent_id?: string | null;
  slug?: string;
  title?: string;
  content?: string;
  status?: DocPageStatus;
  order_index?: number;
}

// ─── Notifications ───────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  kind: string;
  title: string;
  body?: string;
  category?: string;
  entity_type?: string;
  entity_id?: string;
  action_url?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  unread_count: number;
}

export interface UnreadCountResponse {
  unread_count: number;
}

// ─── Health ──────────────────────────────────────────────────────────────────

export interface HealthResponse {
  status: string;
  version?: string;
}
