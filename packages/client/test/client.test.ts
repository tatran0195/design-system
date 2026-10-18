import { createCmsClient } from '../src/client.js';
import { createMemoryTokenStore } from '../src/token-store.js';
import { describe, expect, it } from 'bun:test';

describe('createCmsClient', () => {
  it('initializes with default options', () => {
    const client = createCmsClient();
    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
    expect(client.sites).toBeDefined();
    expect(client.docs).toBeDefined();
    expect(client.notifications).toBeDefined();
    expect(client.health).toBeDefined();
  });

  it('uses provided memory token store', () => {
    const tokenStore = createMemoryTokenStore();
    tokenStore.setToken('test_token_abc');

    const client = createCmsClient({
      baseUrl: 'http://localhost:3000/api',
      tokenStore,
    });

    expect(client._tokenStore.getToken()).toBe('test_token_abc');
  });

  it('clears tokens on logout', async () => {
    const tokenStore = createMemoryTokenStore();
    tokenStore.setToken('session_tok_1');
    tokenStore.setRefreshToken('refresh_tok_1');

    // Mock the internal ky request for auth/logout
    const client = createCmsClient({
      baseUrl: 'http://localhost:9999/api',
      tokenStore,
    });

    // We can test that tokenStore gets cleared upon logout invocation (or error)
    try {
      await client.auth.logout();
    } catch {
      // network failure is expected since port 9999 is closed,
      // but finally block should still clear tokens
    }

    expect(tokenStore.getToken()).toBeNull();
    expect(tokenStore.getRefreshToken()).toBeNull();
  });
});
