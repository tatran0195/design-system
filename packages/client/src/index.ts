// Core SDK — framework-agnostic

export type { AuthMode, CmsClient, CmsClientOptions } from './client.js';
export { createCmsClient } from './client.js';
export { CmsApiError, parseCmsError } from './error.js';
export type { TokenStore } from './token-store.js';
export {
  createCookieTokenStore,
  createLocalStorageTokenStore,
  createMemoryTokenStore,
  localStorageTokenStore,
  readCsrfToken,
} from './token-store.js';
export type {
  // Auth
  AuthProviderId,
  AuthResponse,
  CreateDocPageRequest,
  CreateSiteRequest,
  // Docs
  DocPage,
  DocPageStatus,
  // Health
  HealthResponse,
  LoginRequest,
  MfaChallengeDTO,
  // Notifications
  Notification,
  NotificationListResponse,
  RefreshTokenRequest,
  SignUpRequest,
  // Sites
  Site,
  UnreadCountResponse,
  UpdateDocPageRequest,
  UpdateSiteRequest,
  UserInfo,
  VerifyMfaRequest,
} from './types.js';
