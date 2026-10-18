import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { ApiResponseError, getData, mutateData } from './response';

describe('HTTP error normalization boundary', () => {
  it('preserves status, code and a field validation detail', async () => {
    const response = Response.json(
      { error: { code: 'INVALID_FIELD', message: 'Cannot save.', details: { errors: [{ path: 'title', message: 'Required' }] } } },
      { status: 422 },
    );
    await expect(mutateData(response, 'Save failed')).rejects.toMatchObject({
      name: 'ApiResponseError',
      status: 422,
      code: 'INVALID_FIELD',
      message: 'Cannot save. title: Required',
    });
  });
  it.each([null, [], { error: 'unsafe' }, 'not an envelope'])(
    'handles malformed untrusted error JSON without asserting its shape: %j',
    async (body) => {
      await expect(getData(Response.json(body, { status: 503 }), 'document')).rejects.toMatchObject({
        status: 503,
        message: 'Failed to load document.',
      });
    },
  );
  it('handles non-JSON error pages', async () => {
    await expect(getData(new Response('<html>', { status: 502 }), 'document')).rejects.toBeInstanceOf(ApiResponseError);
  });
  it('retains successful wire data exactly', async () => {
    expect(await getData<{ id: string }>(Response.json({ data: { id: 'page-1' } }), 'page', z.object({ id: z.string() }))).toEqual({ id: 'page-1' });
  });
});
