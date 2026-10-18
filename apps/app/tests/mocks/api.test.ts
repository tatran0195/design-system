import { getResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createMockApi, MOCK_API_ORIGIN } from '../../scripts/mocks/handlers.mjs';
import { branchSchema, languageSchema, pageSchema } from '../../src/integrations/nibleaf/contracts/responses/content';
import { projectSchema } from '../../src/integrations/nibleaf/contracts/responses/projects';
import { deploymentSchema } from '../../src/integrations/nibleaf/contracts/responses/publishing';
import { readerAccessDataSchema } from '../../src/integrations/nibleaf/contracts/responses/reader-access';
import { ApiContractError, getData } from '../../src/shared/api/response';

const request = (path: string, body?: object) =>
  new Request(
    MOCK_API_ORIGIN + path,
    body ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) } : undefined,
  );
describe('MSW mock API is an explicit protocol implementation', () => {
  it('intercepts app API requests through the shared Vitest server', async () => {
    const response = await fetch('http://localhost/api/app/projects');
    expect(response.ok).toBe(true);
    const projects = await getData(response, 'projects', z.array(projectSchema));
    expect(projects).toHaveLength(2);

    const pagesResponse = await fetch('http://localhost/api/app/projects/design-handbook/pages');
    expect(pagesResponse.ok).toBe(true);
    const pages = await getData(pagesResponse, 'pages', z.array(pageSchema));
    expect(pages.length).toBeGreaterThan(0);
  });
  it('returns projects through the actual validated envelope', async () => {
    const response = await getResponse(createMockApi().handlers, request('/api/app/projects'));
    if (!response) throw new Error('Unhandled mock request');
    const projects = await getData(response, 'projects', z.array(projectSchema));
    expect(projects).toHaveLength(2);
  });
  it('satisfies document/language/branch/deployment/access contracts', async () => {
    const handlers = createMockApi().handlers;
    for (const [path, schema] of [
      ['pages/design-handbook-page-0', pageSchema],
      ['languages', z.array(languageSchema)],
      ['branches', z.array(branchSchema)],
      ['deployments', z.array(deploymentSchema)],
      ['reader-access', readerAccessDataSchema],
    ]) {
      const response = await getResponse(handlers, request(`/api/app/projects/design-handbook/${path}`));
      if (!response) throw new Error('Unhandled mock request');
      expect(schema.safeParse((await response.json()).data).success).toBe(true);
    }
  });
  it('rejects a wrong code instead of pretending authentication succeeded', async () => {
    const response = await getResponse(
      createMockApi().handlers,
      request('/api/auth/sign-in/email-otp', { email: 'alex@company.test', otp: '000000' }),
    );
    expect(response?.status).toBe(400);
  });
  it('supports deterministic service-error and malformed-data scenarios', async () => {
    const handlers = createMockApi().handlers;
    await getResponse(handlers, request('/api/__design/scenario', { name: 'server-error', path: '/api/app/projects' }));
    const failed = await getResponse(handlers, request('/api/app/projects'));
    expect(failed?.status).toBe(503);
    await getResponse(handlers, request('/api/__design/scenario', { name: 'malformed-response', path: '/api/app/projects' }));
    const malformed = await getResponse(handlers, request('/api/app/projects'));
    if (!malformed) throw new Error('Unhandled mock request');
    await expect(getData(malformed, 'projects', z.array(projectSchema))).rejects.toBeInstanceOf(ApiContractError);
  });
  it('marks the engine and refuses unknown auth operations', async () => {
    const handlers = createMockApi().handlers;
    const marker = await getResponse(handlers, request('/api/__design/session'));
    expect(await marker?.json()).toMatchObject({ engine: 'msw' });
    const unknown = await getResponse(handlers, request('/api/auth/unknown'));
    expect(unknown?.status).toBe(501);
  });
});
