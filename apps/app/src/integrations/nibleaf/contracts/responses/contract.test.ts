import { expect, it } from 'vitest';
import { z } from 'zod';
import { ApiContractError, getData } from '@/shared/api/response';
import { projectSchema } from './projects';
import { safeUrlSchema } from './url';

it('rejects malformed 200 bodies before they enter the query cache', async () => {
  for (const body of [{ data: {} }, { data: [{ id: 'one' }] }, { unexpected: true }, null])
    await expect(getData(Response.json(body), 'projects', z.array(projectSchema))).rejects.toBeInstanceOf(ApiContractError);
});
it('does not include private response fields in contract failure messages', async () => {
  const secret = 'do-not-log-this-token';
  try {
    await getData(Response.json({ data: { secret } }), 'projects', z.array(projectSchema));
    throw new Error('Expected failure');
  } catch (error) {
    expect(String(error)).not.toContain(secret);
  }
});
it.each(['javascript:alert(1)', 'data:text/html,<script>', '//evil.example/path', 'https://user:password@example.test/', '/\\evil.example'])(
  'rejects unsafe action URLs: %s',
  (url) => {
    expect(safeUrlSchema.safeParse(url).success).toBe(false);
  },
);
it.each(['/api/download/id', 'https://storage.example.test/path?signature=fixture'])('keeps legitimate signed/relative action URLs: %s', (url) => {
  expect(safeUrlSchema.parse(url)).toBe(url);
});
