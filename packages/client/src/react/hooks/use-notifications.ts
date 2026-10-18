import { type UseMutationOptions, type UseQueryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NotificationListResponse, UnreadCountResponse } from '../../types.js';
import { useCmsClient } from '../context.js';
import { queryKeys } from '../query-keys.js';

// ─── useNotifications ─────────────────────────────────────────────────────────

export function useNotifications(params?: { unread?: boolean; limit?: number }, options?: Partial<UseQueryOptions<NotificationListResponse>>) {
  const client = useCmsClient();
  return useQuery<NotificationListResponse>({
    queryKey: queryKeys.notifications.lists(params),
    queryFn: () => client.notifications.list(params),
    staleTime: 30_000,
    refetchInterval: 60_000, // poll every minute for new notifications
    ...options,
  });
}

// ─── useUnreadNotificationCount ───────────────────────────────────────────────

export function useUnreadNotificationCount(options?: Partial<UseQueryOptions<UnreadCountResponse>>) {
  const client = useCmsClient();
  return useQuery<UnreadCountResponse>({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: () => client.notifications.unreadCount(),
    staleTime: 15_000,
    refetchInterval: 30_000,
    ...options,
  });
}

// ─── useMarkNotificationRead ──────────────────────────────────────────────────

export function useMarkNotificationRead(options?: Partial<UseMutationOptions<void, Error, string>>) {
  const client = useCmsClient();
  const qc = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => client.notifications.markRead(id),
    onSuccess(_data, _id, ...rest) {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all() });
      options?.onSuccess?.(_data, _id, ...rest);
    },
    ...options,
  });
}

// ─── useMarkAllNotificationsRead ──────────────────────────────────────────────

export function useMarkAllNotificationsRead(options?: Partial<UseMutationOptions<void, Error, void>>) {
  const client = useCmsClient();
  const qc = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => client.notifications.markAllRead(),
    onSuccess(...args) {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all() });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}
