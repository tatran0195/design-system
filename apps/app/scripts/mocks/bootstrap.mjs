import { resolve } from 'node:path';
import { setupServer } from 'msw/node';
import { createMockApi, MOCK_API_ORIGIN } from './handlers.mjs';

if (process.env.CMS_MSW_PREVIEW !== 'true') throw new Error('MSW requires explicit mock-preview opt-in.');
const expected = resolve(import.meta.dirname, '../../.cache/design-output/server/index.mjs');
if (resolve(process.argv[1] ?? '') !== expected) throw new Error('Refusing to enable MSW for a non-design production artifact.');
const mock = createMockApi();
const server = setupServer(...mock.handlers);
const own = `http://127.0.0.1:${process.env.PORT ?? '4310'}`;
server.listen({
  onUnhandledRequest(request, print) {
    const url = new URL(request.url);
    // SSR may call its own same-origin proxy. All mock backend calls must be handled;
    // external service traffic is not silently allowed by this preview.
    if (url.origin === own || url.origin === own.replace('127.0.0.1', 'localhost')) return;
    print.error();
  },
});
process.once('exit', () => server.close());
console.log(`MSW mock API active for ${MOCK_API_ORIGIN}; no backend daemon or real credentials.`);
