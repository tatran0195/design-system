import { AsyncLocalStorage } from 'node:async_hooks';
import { serverEnv } from '../env.server';
export interface PublishedRequestAuth {
  ip: string | null;
  cookie: string | null;
  authorization: string | null;
}
export const publishedRequestAuth = new AsyncLocalStorage<PublishedRequestAuth>();
/** Server-only loopback origin: never a browser-facing URL or a build-time public origin. */
export const getApiOrigin = () => `http://127.0.0.1:${serverEnv.PORT}`;
export function internalRequestHeaders() {
  const context = publishedRequestAuth.getStore();
  const internalSecret = serverEnv.INTERNAL_API_SECRET ?? '';
  return {
    ...(context?.ip ? { 'x-nibleaf-client-ip': context.ip } : {}),
    ...(context?.ip && internalSecret ? { 'x-nibleaf-internal': internalSecret } : {}),
    ...(context?.cookie ? { cookie: context.cookie } : {}),
    ...(context?.authorization ? { authorization: context.authorization } : {}),
  };
}
export function publicMachineRequestHeaders() {
  const context = publishedRequestAuth.getStore();
  const internalSecret = serverEnv.INTERNAL_API_SECRET ?? '';
  return {
    ...(context?.ip ? { 'x-nibleaf-client-ip': context.ip } : {}),
    ...(context?.ip && internalSecret ? { 'x-nibleaf-internal': internalSecret } : {}),
  };
}
/** Explicit HTTP port. No global fetch replacement, SDK monkey-patch, or captured global fetch. */
export async function fetchApi(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const target = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
  if (target.origin !== getApiOrigin() || !target.pathname.startsWith('/api/'))
    throw new TypeError('Nibleaf API requests must target this process API origin.');
  const headers = new Headers(init?.headers ?? (typeof input !== 'string' && !(input instanceof URL) ? input.headers : undefined));
  // Caller hints are never proof of trust. Only the verified request scope may stamp them.
  headers.delete('x-nibleaf-client-ip');
  headers.delete('x-nibleaf-internal');
  for (const [name, value] of Object.entries(internalRequestHeaders())) if (value !== undefined) headers.set(name, value);
  return globalThis.fetch(input, { ...init, headers });
}
