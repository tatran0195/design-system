import { createIsomorphicFn } from '@tanstack/react-start';
import { requestNonceStore } from '@/app/bootstrap/request-nonce.server';

/** Set before Start initializes its serializer, not just before React renders.
 * The server entry opens this scope before invoking Start. */
export const requestNonce = createIsomorphicFn()
  .server(() => requestNonceStore.getStore())
  .client(() => document.querySelector<HTMLMetaElement>('meta[property="csp-nonce"]')?.content);
