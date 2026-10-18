// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { endpoint } from '@/integrations/nibleaf/transport';
import { setLanguage } from '@/shared/i18n';

afterEach(async () => {
  vi.restoreAllMocks();
  await setLanguage('en');
});
describe('retained Nibleaf HTTP contract', () => {
  it('encodes path parameters and keeps repeated query values, zero and false', () => {
    const url = endpoint('/api/app/projects/:id').$url({
      param: { id: 'team/a?b' },
      query: { tag: ['one', 'two'], count: 0, enabled: false, omit: undefined },
    });
    expect(url.origin).toBe(window.location.origin);
    expect(url.pathname).toBe('/api/app/projects/team%2Fa%3Fb');
    expect(url.searchParams.getAll('tag')).toEqual(['one', 'two']);
    expect(url.searchParams.get('count')).toBe('0');
    expect(url.searchParams.get('enabled')).toBe('false');
    expect(url.searchParams.has('omit')).toBe(false);
  });
  it('sends JSON, credentials, caller headers and the exact upstream locale header', async () => {
    await setLanguage('ar');
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json({ data: { ok: true } }));
    await endpoint('/api/app/projects/:id').$patch(
      { param: { id: 'docs' }, json: { name: 'Handbook' } },
      { init: { headers: { 'x-request-id': 'fixture-request' } } },
    );
    const call = fetch.mock.calls[0];
    expect(String(call?.[0])).toBe(`${window.location.origin}/api/app/projects/docs`);
    expect(call?.[1]?.method).toBe('PATCH');
    expect(call?.[1]?.credentials).toBe('include');
    expect(call?.[1]?.body).toBe('{"name":"Handbook"}');
    const headers = new Headers(call?.[1]?.headers);
    expect(headers.get('content-type')).toBe('application/json');
    expect(headers.get('x-request-id')).toBe('fixture-request');
    expect(headers.get('x-nibleaf-locale')).toBe('ar');
    expect(headers.has('x-cms-locale')).toBe(false);
  });
  it('lets the browser supply multipart boundaries instead of JSON-encoding files', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json({ data: { ok: true } }));
    await endpoint('/api/app/uploads').$post({ form: { name: 'document', file: new Blob(['hello'], { type: 'text/plain' }) } });
    const init = fetch.mock.calls[0]?.[1];
    expect(new Headers(init?.headers).has('content-type')).toBe(false);
    const body = init?.body;
    if (!(body instanceof FormData)) throw new Error('Expected native multipart data');
    expect(body.get('name')).toBe('document');
    expect(body.get('file')).toBeInstanceOf(Blob);
  });
  it('rejects unresolved route parameters rather than sending malformed URLs', () => {
    expect(() => endpoint('/api/app/projects/:id').$url()).toThrow('Missing API path parameter: id');
  });
});
it('forwards cancellation without changing the request wire contract', async () => {
  const controller = new AbortController();
  const network = vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json({ data: [] }));
  await endpoint('/api/app/projects').$get(undefined, { init: { signal: controller.signal } });
  expect(network.mock.calls[0]?.[1]?.signal).toBe(controller.signal);
});
