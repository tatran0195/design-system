import ky, { type AfterResponseHook, type AfterResponseState, type BeforeRequestHook, type BeforeRequestState, type KyInstance } from 'ky';
import { parseCmsError } from './error.js';
import { createCookieTokenStore, createMemoryTokenStore, readCsrfToken, type TokenStore } from './token-store.js';
import type {
  AuthResponse,
  CreateDocPageRequest,
  CreateSiteRequest,
  DocPage,
  HealthResponse,
  LoginRequest,
  NotificationListResponse,
  RefreshTokenRequest,
  SignUpRequest,
  Site,
  UnreadCountResponse,
  UpdateDocPageRequest,
  UpdateSiteRequest,
  VerifyMfaRequest,
} from './types.js';

// ─── Options ─────────────────────────────────────────────────────────────────

export type AuthMode = 'cookie' | 'bearer';

export interface CmsClientOptions {
  /**
   * Base URL of the CMS API server.
   * @default "/api"
   */
  baseUrl?: string;

  /**
   * Authentication mode:
   * - `'cookie'` (default): Uses browser HttpOnly session cookies with `credentials: 'include'`
   *   and double-submit CSRF cookie protection. Never stores raw tokens in JavaScript localStorage.
   *   Follows standard security best practices (Medusa / MedBrains).
   * - `'bearer'`: Uses explicit Bearer token in the `Authorization` header. Ideal for native
   *   apps (React Native), CLI, SSR, or API token authentication.
   * @default "cookie"
   */
  authMode?: AuthMode;

  /**
   * Initial bearer token (automatically switches authMode to 'bearer' if provided).
   */
  token?: string;

  /**
   * Pluggable token storage for bearer mode.
   * Defaults to in-memory store in bearer mode, or cookie store in cookie mode.
   */
  tokenStore?: TokenStore;

  /**
   * When `true` (default), the client automatically attempts a session/token refresh
   * on 401 responses and retries the original request once.
   */
  autoRefresh?: boolean;

  /**
   * Optional callback invoked when a refresh attempt fails or session has expired.
   */
  onUnauthenticated?: () => void;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

const MUTATION_METHODS = new Set(['POST', 'PUT', 'DELETE', 'PATCH']);

/** Singleton refresh-in-flight promise — prevents parallel refresh races. */
let refreshPromise: Promise<string | boolean> | null = null;

// ─── Client factory ───────────────────────────────────────────────────────────

/**
 * Creates a `CmsClient` instance following Medusa and MedBrains security standards.
 *
 * Defaults to secure, HttpOnly cookie-based session management (`credentials: 'include'`)
 * without persisting credentials in JavaScript-accessible `localStorage`.
 *
 * ```ts
 * // Web browser (cookie-first, CSRF protected):
 * const client = createCmsClient();
 *
 * // Native / Mobile / CLI / Test (bearer token):
 * const client = createCmsClient({
 *   authMode: "bearer",
 *   token: "api_key_or_jwt",
 * });
 * ```
 */
export function createCmsClient(options: CmsClientOptions = {}): CmsClient {
  const {
    baseUrl = '/api',
    authMode = options.token ? 'bearer' : 'cookie',
    tokenStore = options.token ? createMemoryTokenStore(options.token) : authMode === 'bearer' ? createMemoryTokenStore() : createCookieTokenStore(),
    autoRefresh = true,
    onUnauthenticated,
  } = options;

  // ── ky v2 hooks ────────────────────────────────────────────────────────────

  /**
   * beforeRequest:
   * 1. In bearer mode, attaches `Authorization: Bearer <token>` from tokenStore.
   * 2. For mutation methods (POST, PUT, DELETE, PATCH), attaches `X-CSRF-Token`
   *    from readable cookie or store if present.
   */
  const attachAuth: BeforeRequestHook = ({ request }: BeforeRequestState) => {
    // 1. Bearer token (if present in store)
    const token = tokenStore.getToken();
    if (token) {
      request.headers.set('authorization', `Bearer ${token}`);
    }

    // 2. Double-submit CSRF protection on mutating requests
    const method = request.method.toUpperCase();
    if (MUTATION_METHODS.has(method)) {
      const csrf = readCsrfToken();
      if (csrf) {
        request.headers.set('x-csrf-token', csrf);
      }
    }
  };

  /**
   * afterResponse: on 401, attempt one token/cookie refresh then retry via ky.retry().
   */
  const handleRefresh: AfterResponseHook = async ({ request, response, retryCount }: AfterResponseState) => {
    if (response.status !== 401 || !autoRefresh || retryCount > 0) return;

    // Avoid refresh loops
    if (request.url.includes('/auth/refresh') || request.url.includes('/auth/login')) {
      onUnauthenticated?.();
      return;
    }

    try {
      refreshPromise ??= doRefresh(tokenStore, baseUrl, authMode);
      const refreshResult = await refreshPromise;
      refreshPromise = null;

      if (!refreshResult) {
        onUnauthenticated?.();
        return;
      }

      // Rebuild request for retry
      const newHeaders = new Headers(request.headers);
      if (authMode === 'bearer' && typeof refreshResult === 'string') {
        newHeaders.set('authorization', `Bearer ${refreshResult}`);
      }

      // Update CSRF token for retry if needed
      const refreshedCsrf = readCsrfToken();
      if (refreshedCsrf && MUTATION_METHODS.has(request.method.toUpperCase())) {
        newHeaders.set('x-csrf-token', refreshedCsrf);
      }

      return ky.retry({ request: new Request(request, { headers: newHeaders }) });
    } catch {
      refreshPromise = null;
      onUnauthenticated?.();
    }
  };

  /**
   * afterResponse: convert HTTP errors into `CmsApiError`.
   */
  const handleError: AfterResponseHook = async ({ response }: AfterResponseState) => {
    if (!response.ok) {
      throw await parseCmsError(response.clone());
    }
  };

  // ── ky instance ────────────────────────────────────────────────────────────

  const prefix = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  const http: KyInstance = ky.create({
    prefix,
    credentials: 'include', // Always send and receive HttpOnly cookies
    retry: 0,
    hooks: {
      beforeRequest: [attachAuth],
      afterResponse: [handleRefresh, handleError],
    },
  });

  // ── CmsClient API ──────────────────────────────────────────────────────────

  return {
    _http: http,
    _tokenStore: tokenStore,
    authMode,

    setToken(token: string | null) {
      tokenStore.setToken(token);
    },

    getToken() {
      return tokenStore.getToken();
    },

    // ── Auth ──────────────────────────────────────────────────────────────

    auth: {
      async login(body: LoginRequest): Promise<AuthResponse> {
        const data = await http.post('auth/login', { json: body }).json<AuthResponse>();
        persistAuthResponse(tokenStore, authMode, data);
        return data;
      },

      async signup(body: SignUpRequest): Promise<AuthResponse> {
        const data = await http.post('auth/signup', { json: body }).json<AuthResponse>();
        persistAuthResponse(tokenStore, authMode, data);
        return data;
      },

      me(): Promise<AuthResponse> {
        return http.get('auth/me').json<AuthResponse>();
      },

      async verifyMfa(body: VerifyMfaRequest): Promise<AuthResponse> {
        const data = await http.post('auth/mfa/verify', { json: body }).json<AuthResponse>();
        persistAuthResponse(tokenStore, authMode, data);
        return data;
      },

      async refresh(body?: RefreshTokenRequest): Promise<AuthResponse> {
        const payload: RefreshTokenRequest = {
          refresh_token: body?.refresh_token ?? tokenStore.getRefreshToken() ?? undefined,
        };
        const data = await http.post('auth/refresh', { json: payload }).json<AuthResponse>();
        persistAuthResponse(tokenStore, authMode, data);
        return data;
      },

      async ssoLogin(provider: string): Promise<AuthResponse> {
        const data = await http.post(`auth/sso/${provider}`).json<AuthResponse>();
        persistAuthResponse(tokenStore, authMode, data);
        return data;
      },

      async logout(): Promise<void> {
        try {
          await http.post('auth/logout');
        } finally {
          tokenStore.setToken(null);
          tokenStore.setRefreshToken(null);
        }
      },
    },

    // ── Sites ─────────────────────────────────────────────────────────────

    sites: {
      list(): Promise<Site[]> {
        return http.get('sites').json<Site[]>();
      },

      get(id: string): Promise<Site> {
        return http.get(`sites/${id}`).json<Site>();
      },

      create(body: CreateSiteRequest): Promise<Site> {
        return http.post('sites', { json: body }).json<Site>();
      },

      update(id: string, body: UpdateSiteRequest): Promise<Site> {
        return http.put(`sites/${id}`, { json: body }).json<Site>();
      },

      async delete(id: string): Promise<void> {
        await http.delete(`sites/${id}`);
      },
    },

    // ── Docs ──────────────────────────────────────────────────────────────

    docs: {
      list(siteId: string): Promise<DocPage[]> {
        return http.get(`sites/${siteId}/pages`).json<DocPage[]>();
      },

      get(siteId: string, pageId: string): Promise<DocPage> {
        return http.get(`sites/${siteId}/pages/${pageId}`).json<DocPage>();
      },

      getBySlug(siteId: string, slug: string): Promise<DocPage> {
        return http.get(`sites/${siteId}/pages/by-slug/${slug}`).json<DocPage>();
      },

      create(body: CreateDocPageRequest): Promise<DocPage> {
        return http.post(`sites/${body.site_id}/pages`, { json: body }).json<DocPage>();
      },

      update(siteId: string, pageId: string, body: UpdateDocPageRequest): Promise<DocPage> {
        return http.put(`sites/${siteId}/pages/${pageId}`, { json: body }).json<DocPage>();
      },

      async delete(siteId: string, pageId: string): Promise<void> {
        await http.delete(`sites/${siteId}/pages/${pageId}`);
      },
    },

    // ── Notifications ─────────────────────────────────────────────────────

    notifications: {
      list(params?: { unread?: boolean; limit?: number }): Promise<NotificationListResponse> {
        return http.get('notifications', { searchParams: buildSearchParams(params) }).json<NotificationListResponse>();
      },

      unreadCount(): Promise<UnreadCountResponse> {
        return http.get('notifications/unread-count').json<UnreadCountResponse>();
      },

      markRead(id: string): Promise<void> {
        return http.put(`notifications/${id}/read`).json<void>();
      },

      markAllRead(): Promise<void> {
        return http.post('notifications/read-all').json<void>();
      },
    },

    // ── Health ────────────────────────────────────────────────────────────

    health(): Promise<HealthResponse> {
      return http.get('health').json<HealthResponse>();
    },
  };
}

// ─── Type: CmsClient ─────────────────────────────────────────────────────────

export interface CmsClient {
  _http: KyInstance;
  _tokenStore: TokenStore;
  authMode: AuthMode;

  setToken(token: string | null): void;
  getToken(): string | null;

  auth: {
    login(body: LoginRequest): Promise<AuthResponse>;
    signup(body: SignUpRequest): Promise<AuthResponse>;
    me(): Promise<AuthResponse>;
    verifyMfa(body: VerifyMfaRequest): Promise<AuthResponse>;
    refresh(body?: RefreshTokenRequest): Promise<AuthResponse>;
    ssoLogin(provider: string): Promise<AuthResponse>;
    logout(): Promise<void>;
  };

  sites: {
    list(): Promise<Site[]>;
    get(id: string): Promise<Site>;
    create(body: CreateSiteRequest): Promise<Site>;
    update(id: string, body: UpdateSiteRequest): Promise<Site>;
    delete(id: string): Promise<void>;
  };

  docs: {
    list(siteId: string): Promise<DocPage[]>;
    get(siteId: string, pageId: string): Promise<DocPage>;
    getBySlug(siteId: string, slug: string): Promise<DocPage>;
    create(body: CreateDocPageRequest): Promise<DocPage>;
    update(siteId: string, pageId: string, body: UpdateDocPageRequest): Promise<DocPage>;
    delete(siteId: string, pageId: string): Promise<void>;
  };

  notifications: {
    list(params?: { unread?: boolean; limit?: number }): Promise<NotificationListResponse>;
    unreadCount(): Promise<UnreadCountResponse>;
    markRead(id: string): Promise<void>;
    markAllRead(): Promise<void>;
  };

  health(): Promise<HealthResponse>;
}

// ─── Internal utilities ───────────────────────────────────────────────────────

function persistAuthResponse(store: TokenStore, authMode: AuthMode, data: AuthResponse): void {
  // In bearer mode, store tokens in the configured TokenStore
  if (authMode === 'bearer') {
    if (data.token) store.setToken(data.token);
    if (data.refresh_token) store.setRefreshToken(data.refresh_token);
  }
}

async function doRefresh(store: TokenStore, baseUrl: string, authMode: AuthMode): Promise<string | boolean> {
  const prefix = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  try {
    const refreshToken = authMode === 'bearer' ? store.getRefreshToken() : undefined;
    const res = await ky
      .post(`${prefix}auth/refresh`, {
        json: refreshToken ? ({ refresh_token: refreshToken } satisfies RefreshTokenRequest) : {},
        credentials: 'include',
        retry: 0,
      })
      .json<AuthResponse>();

    if (authMode === 'bearer') {
      if (res.token) {
        store.setToken(res.token);
        if (res.refresh_token) store.setRefreshToken(res.refresh_token);
        return res.token;
      }
      return false;
    }

    // Cookie-based session successfully refreshed
    return true;
  } catch {
    store.setToken(null);
    store.setRefreshToken(null);
    return false;
  }
}

function buildSearchParams(params?: Record<string, string | number | boolean | undefined>): URLSearchParams {
  const sp = new URLSearchParams();
  if (!params) return sp;
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) sp.set(key, String(value));
  }
  return sp;
}

export { CmsApiError } from './error.js';
