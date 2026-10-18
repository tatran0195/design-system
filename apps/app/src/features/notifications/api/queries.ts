import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { queryKeys } from '@/integrations/nibleaf/cache-keys';
import { notificationListSchema } from '@/integrations/nibleaf/contracts/responses/notifications';
import { api } from '@/integrations/nibleaf/endpoints';
import { getData } from '@/shared/api/response';

export const useNotifications = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: queryKeys.notifications.list(),
    enabled: options?.enabled ?? true,
    queryFn: async ({ signal }) =>
      getData(
        await api.app.notifications.$get({ query: {} }, { init: { signal } }),
        'notifications',
        z.lazy(() => notificationListSchema),
      ),
  });

export const useUnreadNotificationCount = () =>
  useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    refetchInterval: 60_000,
    queryFn: async ({ signal }) =>
      getData(await api.app.notifications['unread-count'].$get(undefined, { init: { signal } }), 'notifications', z.object({ count: z.number() })),
  });
