import { createCookieTokenStore, createLocalStorageTokenStore, createMemoryTokenStore, readCsrfToken } from '../src/token-store.js';
import { describe, expect, it } from 'bun:test';

describe('createCookieTokenStore', () => {
  it('never stores tokens in JavaScript memory', () => {
    const store = createCookieTokenStore();
    expect(store.getToken()).toBeNull();
    expect(store.getRefreshToken()).toBeNull();

    // Setting token is a no-op because cookies are HttpOnly
    store.setToken('some_token');
    expect(store.getToken()).toBeNull();
  });
});

describe('createMemoryTokenStore', () => {
  it('initializes with null tokens or initial token', () => {
    const store = createMemoryTokenStore();
    expect(store.getToken()).toBeNull();
    expect(store.getRefreshToken()).toBeNull();

    const preloaded = createMemoryTokenStore('init_tok');
    expect(preloaded.getToken()).toBe('init_tok');
  });

  it('saves and retrieves access token', () => {
    const store = createMemoryTokenStore();
    store.setToken('access_token_123');
    expect(store.getToken()).toBe('access_token_123');

    store.setToken(null);
    expect(store.getToken()).toBeNull();
  });

  it('saves and retrieves refresh token', () => {
    const store = createMemoryTokenStore();
    store.setRefreshToken('refresh_token_456');
    expect(store.getRefreshToken()).toBe('refresh_token_456');

    store.setRefreshToken(null);
    expect(store.getRefreshToken()).toBeNull();
  });
});

describe('createLocalStorageTokenStore', () => {
  it('provides opt-in local storage store', () => {
    const store = createLocalStorageTokenStore('test_');
    expect(store).toBeDefined();
    expect(typeof store.getToken).toBe('function');
  });
});

describe('readCsrfToken', () => {
  it('returns null when running in non-browser environment', () => {
    expect(readCsrfToken()).toBeNull();
  });
});
