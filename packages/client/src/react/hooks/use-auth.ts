import { type UseMutationOptions, type UseQueryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AuthResponse, LoginRequest, RefreshTokenRequest, SignUpRequest, UserInfo, VerifyMfaRequest } from '../../types.js';
import { useCmsClient } from '../context.js';
import { queryKeys } from '../query-keys.js';

// ─── useMe ────────────────────────────────────────────────────────────────────

/**
 * Fetches the currently authenticated user (`GET /api/auth/me`).
 * Returns `null` for the `data.user` field when unauthenticated (no token).
 *
 * ```tsx
 * const { data, isLoading } = useMe();
 * const user = data?.user;
 * ```
 */
export function useMe(options?: Partial<UseQueryOptions<AuthResponse>>) {
  const client = useCmsClient();
  const shouldEnable = options?.enabled ?? (client.authMode === 'cookie' || Boolean(client.getToken()));

  return useQuery<AuthResponse>({
    queryKey: queryKeys.auth.me(),
    queryFn: () => client.auth.me(),
    staleTime: 5 * 60 * 1000, // 5 min — user info doesn't change often
    retry: false, // a 401 means logged-out; don't retry
    enabled: shouldEnable,
    ...options,
  });
}

// ─── useLogin ─────────────────────────────────────────────────────────────────

/**
 * Mutation for email+password login.
 *
 * On success the `data` is the `AuthResponse`, which may contain either
 * a `token` (fully authenticated) or an `mfa_challenge` (2FA required).
 *
 * ```tsx
 * const { mutateAsync: login, isPending } = useLogin();
 * const result = await login({ email, password });
 * if (result.mfa_challenge) navigate("/mfa");
 * ```
 */
export function useLogin(options?: Partial<UseMutationOptions<AuthResponse, Error, LoginRequest>>) {
  const client = useCmsClient();
  const qc = useQueryClient();

  return useMutation<AuthResponse, Error, LoginRequest>({
    mutationFn: (body) => client.auth.login(body),
    onSuccess(data, ...rest) {
      if (data.user) {
        // Populate the `me` cache immediately — avoids an extra round-trip
        qc.setQueryData<AuthResponse>(queryKeys.auth.me(), data);
      }
      options?.onSuccess?.(data, ...rest);
    },
    ...options,
  });
}

// ─── useSignUp ────────────────────────────────────────────────────────────────

export function useSignUp(options?: Partial<UseMutationOptions<AuthResponse, Error, SignUpRequest>>) {
  const client = useCmsClient();
  const qc = useQueryClient();

  return useMutation<AuthResponse, Error, SignUpRequest>({
    mutationFn: (body) => client.auth.signup(body),
    onSuccess(data, ...rest) {
      if (data.user) {
        qc.setQueryData<AuthResponse>(queryKeys.auth.me(), data);
      }
      options?.onSuccess?.(data, ...rest);
    },
    ...options,
  });
}

// ─── useVerifyMfa ─────────────────────────────────────────────────────────────

export function useVerifyMfa(options?: Partial<UseMutationOptions<AuthResponse, Error, VerifyMfaRequest>>) {
  const client = useCmsClient();
  const qc = useQueryClient();

  return useMutation<AuthResponse, Error, VerifyMfaRequest>({
    mutationFn: (body) => client.auth.verifyMfa(body),
    onSuccess(data, ...rest) {
      if (data.user) {
        qc.setQueryData<AuthResponse>(queryKeys.auth.me(), data);
      }
      options?.onSuccess?.(data, ...rest);
    },
    ...options,
  });
}

// ─── useSsoLogin ──────────────────────────────────────────────────────────────

export function useSsoLogin(options?: Partial<UseMutationOptions<AuthResponse, Error, string>>) {
  const client = useCmsClient();
  const qc = useQueryClient();

  return useMutation<AuthResponse, Error, string>({
    mutationFn: (provider) => client.auth.ssoLogin(provider),
    onSuccess(data, ...rest) {
      if (data.user) {
        qc.setQueryData<AuthResponse>(queryKeys.auth.me(), data);
      }
      options?.onSuccess?.(data, ...rest);
    },
    ...options,
  });
}

// ─── useRefreshToken ──────────────────────────────────────────────────────────

export function useRefreshToken(options?: Partial<UseMutationOptions<AuthResponse, Error, RefreshTokenRequest | undefined>>) {
  const client = useCmsClient();

  return useMutation<AuthResponse, Error, RefreshTokenRequest | undefined>({
    mutationFn: (body) => client.auth.refresh(body),
    ...options,
  });
}

// ─── useLogout ────────────────────────────────────────────────────────────────

/**
 * Calls `POST /api/auth/logout`, clears stored tokens, then invalidates the
 * entire TanStack Query cache so stale data is never shown post-logout.
 */
export function useLogout(options?: Partial<UseMutationOptions<void, Error, void>>) {
  const client = useCmsClient();
  const qc = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => client.auth.logout(),
    onSettled(...args) {
      qc.clear(); // wipe all cached data after logout
      options?.onSettled?.(...args);
    },
    ...options,
  });
}

// ─── Derived helper ───────────────────────────────────────────────────────────

/** Convenience hook: returns `UserInfo | undefined` and loading state. */
export function useCurrentUser(): { user: UserInfo | undefined; isLoading: boolean } {
  const { data, isLoading } = useMe({ retry: false });
  return { user: data?.user, isLoading };
}
