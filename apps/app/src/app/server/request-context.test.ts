import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/integrations/nibleaf/env.server', () => ({
  serverEnv: { PORT: 4310, TRUSTED_PROXY_HOPS: 1, INTERNAL_API_SECRET: 'fixture-internal', CUSTOM_DOMAIN_EDGE_SECRET: 'fixture-edge' },
}));

import {
  fetchApi,
  getApiOrigin,
  internalRequestHeaders,
  publicMachineRequestHeaders,
  publishedRequestAuth,
} from '@/integrations/nibleaf/server/request-scope.server';
import { clientIpFromForwardedFor, effectiveRequestHost } from './request-context';

const SELF = getApiOrigin();
afterEach(() => vi.unstubAllGlobals());
describe('explicit server HTTP port', () => {
  it('does not install or replace global fetch; verified scope overwrites caller hints', async () => {
    const network = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response('ok'));
    vi.stubGlobal('fetch', network);
    await publishedRequestAuth.run({ ip: '8.8.8.8', cookie: 'reader=one', authorization: 'Bearer fixture' }, () =>
      fetchApi(`${SELF}/api/public/sites/one`, { headers: { 'x-nibleaf-client-ip': 'spoofed', 'x-nibleaf-internal': 'spoofed' } }),
    );
    const headers = new Headers(network.mock.calls[0]?.[1]?.headers);
    expect(headers.get('x-nibleaf-client-ip')).toBe('8.8.8.8');
    expect(headers.get('x-nibleaf-internal')).toBe('fixture-internal');
    expect(headers.get('cookie')).toBe('reader=one');
    expect(globalThis.fetch).toBe(network);
  });
  it('rejects external and path-normalization escapes before forwarding credentials', async () => {
    const network = vi.fn();
    vi.stubGlobal('fetch', network);
    await expect(fetchApi('https://external.example/api/doc', { headers: { cookie: 'private' } })).rejects.toThrow('this process API origin');
    await expect(fetchApi(`${SELF}/api/../private`)).rejects.toThrow('this process API origin');
    expect(network).not.toHaveBeenCalled();
  });
  it('removes spoofed hints outside a verified scope', async () => {
    const network = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response('ok'));
    vi.stubGlobal('fetch', network);
    await fetchApi(`${SELF}/api/public/meta`, { headers: { 'x-nibleaf-internal': 'spoofed', 'x-nibleaf-client-ip': 'spoofed' } });
    expect(new Headers(network.mock.calls[0]?.[1]?.headers).has('x-nibleaf-internal')).toBe(false);
  });
  it('never sends reader credentials to public machine documents', () => {
    publishedRequestAuth.run({ ip: '8.8.8.8', cookie: 'reader=one', authorization: 'Bearer fixture' }, () => {
      expect(internalRequestHeaders()).toHaveProperty('cookie');
      expect(publicMachineRequestHeaders()).not.toHaveProperty('cookie');
      expect(publicMachineRequestHeaders()).not.toHaveProperty('authorization');
    });
  });
  it('isolates concurrent credentials', async () => {
    const a = publishedRequestAuth.run({ ip: null, cookie: 'one', authorization: null }, async () => {
      await Promise.resolve();
      return internalRequestHeaders().cookie;
    });
    const b = publishedRequestAuth.run({ ip: null, cookie: 'two', authorization: null }, async () => {
      await Promise.resolve();
      return internalRequestHeaders().cookie;
    });
    expect(await Promise.all([a, b])).toEqual(['one', 'two']);
  });
  it('does not trust an unproven hostname', () => {
    const request = new Request('https://app.example/', { headers: { 'x-nibleaf-custom-host': 'attacker.example', 'x-nibleaf-edge-secret': 'bad' } });
    expect(effectiveRequestHost(request, new URL(request.url))).toBe('app.example');
  });
});

it('does not trust forwarded IP headers without configured proxy hops', () => {
  expect(clientIpFromForwardedFor('8.8.8.8', 0)).toBeNull();
});
it('ignores invalid IP syntax and selects the rightmost untrusted public hop', () => {
  expect(clientIpFromForwardedFor('not-an-ip, 1.1.1.1, 8.8.8.8', 1)).toBe('1.1.1.1');
  expect(clientIpFromForwardedFor('dead:beef, :::', 1)).toBeNull();
});
