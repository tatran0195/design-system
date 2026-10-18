/**
 * Token and Session storage abstraction.
 *
 * In secure web architectures (Medusa, MedBrains):
 * - Web browsers should use HttpOnly session cookies + SameSite + CSRF tokens.
 *   Raw JWT tokens are NEVER stored in localStorage to prevent XSS exfiltration.
 * - Non-browser environments (React Native, CLI, microservices, tests) can use
 *   in-memory or secure platform storage (e.g. Keychain/Keystore) via `TokenStore`.
 */
export interface TokenStore {
  getToken(): string | null;
  setToken(token: string | null): void;
  getRefreshToken(): string | null;
  setRefreshToken(token: string | null): void;
}

/**
 * Pure cookie-based session store (recommended default for web applications).
 * The browser handles cookies (`HttpOnly`) automatically via `credentials: "include"`.
 * No sensitive tokens are persisted in JavaScript-accessible storage.
 */
export function createCookieTokenStore(): TokenStore {
  return {
    getToken: () => null,
    setToken: () => {},
    getRefreshToken: () => null,
    setRefreshToken: () => {},
  };
}

/**
 * In-memory token store — safe default for non-browser environments, SSR,
 * or unit testing. Does not touch localStorage and resets on page reload.
 */
export function createMemoryTokenStore(initialToken: string | null = null): TokenStore {
  let access: string | null = initialToken;
  let refresh: string | null = null;

  return {
    getToken: () => access,
    setToken: (t) => {
      access = t;
    },
    getRefreshToken: () => refresh,
    setRefreshToken: (t) => {
      refresh = t;
    },
  };
}

const _ACCESS_KEY = 'cms_access_token';
const _REFRESH_KEY = 'cms_refresh_token';

/**
 * Opt-in localStorage token store for native WebViews or platforms where
 * cookies cannot be used and localStorage persistence is explicitly requested.
 *
 * NOTE: Prefer HttpOnly cookies for web browsers to prevent XSS vulnerabilities.
 */
export function createLocalStorageTokenStore(prefix = 'cms_'): TokenStore {
  const accessKey = `${prefix}access_token`;
  const refreshKey = `${prefix}refresh_token`;

  return {
    getToken() {
      if (typeof window === 'undefined') return null;
      try {
        return window.localStorage.getItem(accessKey);
      } catch {
        return null;
      }
    },
    setToken(token) {
      if (typeof window === 'undefined') return;
      try {
        if (token) {
          window.localStorage.setItem(accessKey, token);
        } else {
          window.localStorage.removeItem(accessKey);
        }
      } catch {
        // Storage unavailable (e.g. private mode or sandboxed iframe)
      }
    },
    getRefreshToken() {
      if (typeof window === 'undefined') return null;
      try {
        return window.localStorage.getItem(refreshKey);
      } catch {
        return null;
      }
    },
    setRefreshToken(token) {
      if (typeof window === 'undefined') return;
      try {
        if (token) {
          window.localStorage.setItem(refreshKey, token);
        } else {
          window.localStorage.removeItem(refreshKey);
        }
      } catch {
        // Storage unavailable
      }
    },
  };
}

/** Backward compatibility alias */
export const localStorageTokenStore = createLocalStorageTokenStore();

/**
 * Reads CSRF token from document.cookie (`csrf_token=...`).
 * Follows the double-submit cookie pattern (MedBrains / Django / Rails standard).
 */
export function readCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  try {
    const match = document.cookie
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('csrf_token='));
    if (match) {
      const val = match.slice('csrf_token='.length);
      return val.length > 0 ? decodeURIComponent(val) : null;
    }
  } catch {
    // Non-browser environment
  }
  return null;
}
