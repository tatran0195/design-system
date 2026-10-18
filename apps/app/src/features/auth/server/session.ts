import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { sessionSchema } from '@/integrations/nibleaf/contracts/session';
import { fetchApi, getApiOrigin } from '@/integrations/nibleaf/server/request-scope.server';
/** Server read is request-local; it never mutates a process-wide React auth atom. */
export const getSessionFn = createServerFn({ method: 'GET' }).handler(async () => {
  const incoming = getRequestHeaders();
  const headers = new Headers();
  for (const name of ['cookie', 'authorization', 'x-nibleaf-locale']) {
    const value = incoming.get(name);
    if (value) headers.set(name, value);
  }
  const response = await fetchApi(new URL('/api/auth/get-session', getApiOrigin()), { headers, cache: 'no-store' });
  if (response.status === 401 || response.status === 403) return null;
  if (!response.ok) throw new Error('Authentication service is temporarily unavailable.');
  const result = sessionSchema.nullable().safeParse(await response.json());
  if (!result.success) throw new Error('Authentication service returned an invalid session.');
  return result.data;
});
