import { adminClient, emailOTPClient, organizationClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { env } from '@/integrations/nibleaf/env';
import { getLocale } from '@/shared/i18n';

/** Nibleaf Better Auth contract, still served through the same-origin API proxy. */
export const authClient = createAuthClient({
  baseURL: typeof window === 'undefined' ? env.VITE_APP_URL : window.location.origin,
  basePath: '/api/auth',
  plugins: [emailOTPClient(), organizationClient(), adminClient()],
  fetchOptions: {
    credentials: 'include',
    onRequest: (context) => {
      context.headers.set('x-nibleaf-locale', getLocale());
      return context;
    },
  },
});
export const { signIn, useSession } = authClient;
