import { AsyncLocalStorage } from 'node:async_hooks';
/** Per-request scope shared by the server entry and the router factory. */
export const requestNonceStore = new AsyncLocalStorage<string>();
