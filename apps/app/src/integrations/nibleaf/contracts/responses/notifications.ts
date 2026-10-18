/** Runtime wire response contracts. Schema output is checked against the DTO; no generic casts. */
import { z } from 'zod';
import type { NotificationItem, NotificationList } from '@/integrations/nibleaf/contracts/types';
export const notificationListSchema: z.ZodType<NotificationList> = z.object({
  items: z.array(z.lazy(() => notificationItemSchema)),
  nextCursor: z.union([z.string(), z.null()]),
});
export const notificationItemSchema: z.ZodType<NotificationItem> = z.object({
  id: z.string(),
  projectId: z.union([z.string(), z.null()]),
  type: z.string(),
  title: z.string(),
  body: z.union([z.string(), z.null()]),
  href: z.union([z.string(), z.null()]),
  readAt: z.union([z.string(), z.null()]),
  createdAt: z.string(),
});
