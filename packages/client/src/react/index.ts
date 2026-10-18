// React integration subpath: @cms/client/react

export type { CmsClientProviderProps } from './context.js';
export { CmsClientProvider, useCmsClient } from './context.js';
// Auth
export {
  useCurrentUser,
  useLogin,
  useLogout,
  useMe,
  useRefreshToken,
  useSignUp,
  useSsoLogin,
  useVerifyMfa,
} from './hooks/use-auth.js';
// Docs
export {
  useCreateDocPage,
  useDeleteDocPage,
  useDocPage,
  useDocPageBySlug,
  useDocPages,
  useUpdateDocPage,
} from './hooks/use-docs.js';
// Notifications
export {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from './hooks/use-notifications.js';
// Sites
export {
  useCreateSite,
  useDeleteSite,
  useListSites,
  useSite,
  useUpdateSite,
} from './hooks/use-sites.js';
export { queryKeys } from './query-keys.js';
