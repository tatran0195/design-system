import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/integrations/nibleaf/cache-keys';
import type { MarkNotificationsReadBody } from '@/integrations/nibleaf/contracts/validators/git-config';
import { api } from '@/integrations/nibleaf/endpoints';
import { acknowledgementSchema, mutateData } from '@/shared/api/response';

export const useMarkNotificationsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: MarkNotificationsReadBody) =>
      mutateData(await api.app.notifications.read.$post({ json: body }), 'Could not update notifications.', acknowledgementSchema),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.list() });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
    },
  });
};
