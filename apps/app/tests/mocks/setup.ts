import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';
import { createMockApi, MOCK_API_ORIGIN } from '../../scripts/mocks/handlers.mjs';

export const mockApiServer = setupServer(...createMockApi({ anyOrigin: true }).handlers);

beforeAll(() => {
  mockApiServer.listen({
    onUnhandledRequest(request, print) {
      if (new URL(request.url).pathname.startsWith('/api/')) print.error();
    },
  });
});

beforeEach(async () => {
  const response = await fetch(`${MOCK_API_ORIGIN}/api/__design/reset`, { method: 'POST' });
  if (!response.ok) throw new Error(`Failed to reset MSW mock API: ${response.status}`);
});

afterEach(() => mockApiServer.resetHandlers());
afterAll(() => mockApiServer.close());
