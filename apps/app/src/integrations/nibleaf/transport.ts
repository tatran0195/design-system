import { createIsomorphicFn } from '@tanstack/react-start';
import { createHttpTransport } from '@/shared/api/http';
import { getLocale } from '@/shared/i18n';
import { fetchApi, getApiOrigin } from './server/request-scope.server';

const serverPort = createIsomorphicFn()
  .server(() => ({ origin: getApiOrigin(), send: fetchApi }))
  .client(() => undefined);
export const endpoint = createHttpTransport({
  origin: () => {
    if (typeof window !== 'undefined') return window.location.origin;
    const port = serverPort();
    if (!port) throw new Error('Server API port unavailable.');
    return port.origin;
  },
  fetch: (input, init) => {
    if (typeof window !== 'undefined') return globalThis.fetch(input, init);
    const port = serverPort();
    if (!port) throw new Error('Server API port unavailable.');
    return port.send(input, init);
  },
  headers: () => ({ 'x-nibleaf-locale': getLocale() }),
});
export type { ApiResponse, RequestArguments, RequestOptions } from '@/shared/api/http';
