import { delay, HttpResponse, http } from 'msw';
import { createMockData } from './data.mjs';
export const MOCK_API_ORIGIN = 'http://127.0.0.1:4391';
export function createMockApi({ anyOrigin = false } = {}) {
  const { stamp, user, organization, member, projects, languages, pages, initialProjects, initialPages, session, summary } = createMockData();
  let signedIn = true;
  const apiKeys = [];
  const comments = [];
  const uploads = new Map();

  const send = (data, status = 200, raw = false) => HttpResponse.json(raw ? data : { data }, { status, headers: { 'cache-control': 'no-store' } });
  let scenario = { name: 'normal', path: '' };
  const respond = async ({ request }) => {
    const url = new URL(request.url);
    const original = url.pathname;
    const pathname = original.replace(/^\/api\/app(?=\/)/, '/api');
    const method = request.method;
    const bytes = Buffer.from(await request.arrayBuffer());
    let body = {};
    try {
      body = bytes.length ? JSON.parse(bytes.toString()) : {};
    } catch {
      /* multipart/upload */
    }
    if (pathname === '/api/__design/scenario' && method === 'POST') {
      scenario = { name: body.name ?? 'normal', path: body.path ?? '' };
      return send({ scenario }, 200, true);
    }
    if (!pathname.startsWith('/api/__design/') && scenario.name !== 'normal' && original.includes(scenario.path)) {
      if (scenario.name === 'network-error') return HttpResponse.error();
      if (scenario.name === 'server-error') return send({ error: { code: 'MOCK_SERVER_ERROR', message: 'Mock service unavailable.' } }, 503, true);
      if (scenario.name === 'unauthorized') return send({ error: { code: 'UNAUTHORIZED', message: 'Mock session is not authorized.' } }, 401, true);
      if (scenario.name === 'malformed-response') return send({ unexpected: true });
      if (scenario.name === 'empty') return send([]);
      if (scenario.name === 'slow') await delay(250);
    }
    if (pathname === '/api/__design/reset' && method === 'POST') {
      projects.splice(0, projects.length, ...structuredClone(initialProjects));
      pages.splice(0, pages.length, ...structuredClone(initialPages));
      apiKeys.splice(0);
      comments.splice(0);
      uploads.clear();
      signedIn = true;
      scenario = { name: 'normal', path: '' };
      return send({ reset: true, signedIn }, 200, true);
    }
    if (pathname === '/api/__design/session') {
      if (method !== 'POST') return send({ signedIn, engine: 'msw' }, 200, true);
      signedIn = url.searchParams.get('state') !== 'off';
      return new HttpResponse(null, { status: 303, headers: { location: signedIn ? '/app' : '/sign-in' } });
    }
    if (pathname.startsWith('/api/auth/')) {
      if (pathname.endsWith('/get-session')) return send(signedIn ? session : null, 200, true);
      if (pathname.endsWith('/sign-out')) {
        signedIn = false;
        return send({ success: true }, 200, true);
      }
      if (pathname.endsWith('/sign-in/email-otp') && method === 'POST') {
        if (body.otp !== '123456') return send({ code: 'INVALID_OTP', message: 'The local MSW demo code is 123456.' }, 400, true);
        signedIn = true;
        return send({ user, token: session.session.token }, 200, true);
      }
      if (pathname.endsWith('/organization/list')) return send([organization], 200, true);
      if (pathname.endsWith('/organization/get-full-organization')) return send({ ...organization, members: [member], invitations: [] }, 200, true);
      if (pathname.endsWith('/organization/get-active-member')) return send(member, 200, true);
      if (
        [
          '/email-otp/send-verification-otp',
          '/email-otp/verify-email',
          '/email-otp/request-email-change',
          '/email-otp/change-email',
          '/update-user',
          '/organization/set-active',
        ].some((path) => pathname.endsWith(path)) &&
        method === 'POST'
      )
        return send({ success: true }, 200, true);
      return send({ error: { code: 'MOCK_UNHANDLED_AUTH', message: 'This auth operation is not implemented by the MSW mock.' } }, 501, true);
    }
    if (pathname === '/api/public/meta') return send({ providers: { google: false }, signupDisabled: false });
    if (pathname === '/api/projects') {
      if (method === 'POST') {
        const project = {
          ...projects[0],
          ...body,
          id: `design-project-${projects.length + 1}`,
          createdAt: stamp,
          updatedAt: stamp,
          _count: { pages: 0, deployments: 0 },
        };
        projects.push(project);
        return send(project);
      }
      return send(projects);
    }
    if (pathname === '/api/workspace/analytics') return send(summary);
    if (pathname === '/api/workspace')
      return send({
        ...organization,
        plan: 'internal',
        notifications: {},
        integrations: {},
        git: {},
        projectCount: projects.length,
        memberCount: 1,
      });
    if (pathname.includes('/notifications/unread')) return send({ count: 0 });
    if (pathname.includes('/notifications')) return send({ items: [], nextCursor: null });
    if (pathname.includes('/members')) return send({ members: [member], invitations: [] });
    if (pathname.startsWith('/api/__design/uploads/')) {
      const key = pathname.split('/').at(-1);
      if (method === 'PUT') {
        uploads.set(key, { bytes, type: request.headers.get('content-type') || 'application/octet-stream' });
        return new HttpResponse(null, { status: 204 });
      }
      const upload = uploads.get(key);
      if (upload) {
        return new HttpResponse(upload.bytes, { headers: { 'content-type': upload.type } });
      }
    }
    const match = pathname.match(/^\/api\/projects\/([^/]+)(.*)$/);
    if (match) {
      const id = decodeURIComponent(match[1]);
      const rest = match[2];
      const project = projects.find((p) => p.id === id) ?? projects[0];
      if (!rest) {
        if (method === 'PATCH') Object.assign(project, body, { updatedAt: stamp });
        return send(project);
      }
      if (rest === '/config') {
        if (method === 'PATCH') project.config = { ...project.config, ...body };
        return send(project.config);
      }
      if (rest === '/analytics') return send(summary);
      if (rest === '/languages') {
        const result = languages(id);
        if (method === 'POST') return send({ ...result[0], ...body, id: `${id}-${body.code}`, isDefault: false });
        return send(result);
      }
      if (rest.startsWith('/languages/')) {
        const language = languages(id).find((l) => l.id === rest.split('/')[2]) ?? languages(id)[0];
        return send({ ...language, ...body });
      }
      if (rest === '/branches')
        return send([{ id: `${id}-main`, projectId: id, name: 'main', slug: 'main', isDefault: true, createdAt: stamp, updatedAt: stamp }]);
      if (rest === '/pages') {
        if (method === 'POST') {
          const page = { ...pages[0], ...body, projectId: id, id: `${id}-page-${pages.length}`, createdAt: stamp, updatedAt: stamp };
          pages.push(page);
          return send(page);
        }
        return send(pages.filter((p) => p.projectId === id));
      }
      if (rest.startsWith('/pages/')) {
        const page = pages.find((p) => p.id === rest.split('/')[2]) ?? pages[0];
        if (method === 'PATCH')
          Object.assign(page, body, { updatedAt: new Date(Math.max(Date.now(), Date.parse(page.updatedAt) + 1)).toISOString() });
        return send(page);
      }
      if (rest === '/deployments/pending-changes')
        return send({ hasBaseline: true, lastVersion: 1, lastPublishedAt: stamp, changes: [], redirectIssues: [] });
      if (rest === '/deployments')
        return send([
          {
            id: `${id}-deployment`,
            projectId: id,
            status: 'READY',
            version: 1,
            pagesCount: pages.filter((page) => page.projectId === id).length,
            commitMessage: 'Handbook published',
            error: null,
            errorDetails: null,
            createdAt: stamp,
            updatedAt: stamp,
            completedAt: stamp,
          },
        ]);
      if (rest === '/api-keys') {
        if (method === 'POST') {
          const key = {
            ...body,
            id: `key-${apiKeys.length + 1}`,
            lastFour: 'demo',
            scopes: body.scopes ?? [],
            state: 'active',
            createdAt: stamp,
            lastUsedAt: null,
            expiresAt: '2027-01-01T00:00:00Z',
            revokedAt: null,
            legacy: false,
            rotatedFromId: null,
          };
          apiKeys.push(key);
          return send({ ...key, secret: 'design_only_not_a_real_api_key' });
        }
        return send(apiKeys);
      }
      if (rest === '/comments') {
        if (method === 'POST') {
          const comment = { ...body, id: `comment-${comments.length + 1}`, user, createdAt: stamp, updatedAt: stamp, resolved: false };
          comments.push(comment);
          return send(comment);
        }
        return send(comments);
      }
      if (rest === '/reader-access') return send({ accessMode: 'PUBLIC', audiences: [], readers: [], jwt: null, audit: [] });
      if (rest.includes('/presign')) {
        const key = `design-${Date.now()}`;
        return send({ key, uploadUrl: `/api/__design/uploads/${key}` });
      }
      if (['/domains', '/addons', '/redirects', '/exports', '/export-schedules', '/assets'].includes(rest)) return send([]);
      if (rest === '/git' || rest === '/git/workflow') return send(null);
      if (rest === '/openapi') return send(null);
    }
    const publicMatch = pathname.match(/^\/api\/public\/sites\/([^/]+)(.*)$/);
    if (publicMatch) {
      const id = publicMatch[1];
      const rest = publicMatch[2];
      const project = projects.find((p) => p.id === id) ?? projects[0];
      const language = url.searchParams.get('language') ?? url.searchParams.get('lang') ?? 'en';
      const ownPages = pages.filter((p) => p.projectId === project.id);
      const versions = [{ id: `${id}-main`, name: 'main', slug: 'main', isDefault: true }];
      if (!rest)
        return send({
          project: { ...project, primaryDomain: null },
          nav: ownPages.map((p) => ({ id: p.id, kind: 'PAGE', title: p.title, path: p.path, icon: p.icon, tag: null, children: [] })),
          languages: languages(id),
          versions,
          activeLanguage: language,
          activeVersion: 'main',
          languageConfig: null,
          version: 1,
          generatedAt: stamp,
          openapi: null,
        });
      if (rest === '/markdown') {
        const p = ownPages.find((p) => p.path === url.searchParams.get('path')) ?? ownPages[0];
        return HttpResponse.text(p?.content ?? '', { headers: { 'content-type': 'text/markdown; charset=utf-8' } });
      }
      if (rest === '/page') {
        const p = ownPages.find((p) => p.path === url.searchParams.get('path')) ?? ownPages[0];
        return send({
          project: { ...project, primaryDomain: null },
          page: { ...p, excerpt: 'A shared place for team knowledge.', headings: [{ depth: 2, text: 'Make it yours', id: 'make-it-yours' }] },
          activeLanguage: language,
          activeVersion: 'main',
          versions,
          languageConfig: null,
          languages: languages(id).map((l) => ({ ...l, path: p.path })),
          breadcrumbs: [{ title: p.title, path: p.path }],
          prev: null,
          next: null,
          version: 1,
          generatedAt: stamp,
        });
      }
      if (rest === '/events') {
        return new HttpResponse(null, { status: 204 });
      }
      if (rest === '/search') return send({ hits: [] });
      if (rest === '/changelog') return send([]);
    }
    console.log(`[MSW mock API] ${method} ${original}: not implemented`);
    return send({ code: 'DESIGN_FIXTURE_UNAVAILABLE', message: 'This endpoint is not part of the local UI fixtures.' }, 501, true);
  };
  return { handlers: [http.all(anyOrigin ? '*/api/*' : `${MOCK_API_ORIGIN}/api/*`, respond)] };
}
