import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import type { Register } from '@tanstack/react-router';
import { createStartHandler, defaultStreamHandler, type RequestHandler } from '@tanstack/react-start/server';
import got from 'got';
import { z } from 'zod';
import { requestNonceStore as ssrNonce } from '@/app/bootstrap/request-nonce.server';
import { contentSecurityPolicy } from '@/app/server/content-security-policy';
import { encodePublicRouteManifestResponse } from '@/app/server/public-route-manifest';
import {
  acceptsHtml,
  appendVary,
  isAppOwnedPath,
  isDocumentPath,
  notAcceptableHtmlResponse,
  preferredRepresentation,
} from '@/app/server/request-negotiation';
import {
  canonicalPathFromMarkdownAlias,
  decodePublishedPathname,
  documentUrlForBase,
  markdownAlternateUrl,
  markdownDiscoveryLinkHeader,
} from '@/integrations/nibleaf/contracts/shared/markdown-discovery';
import { serverEnv } from '@/integrations/nibleaf/env.server';
import type { PublishedRequestAuth } from '@/integrations/nibleaf/server/request-scope.server';
import {
  getApiOrigin,
  internalRequestHeaders,
  publicMachineRequestHeaders,
  publishedRequestAuth,
} from '@/integrations/nibleaf/server/request-scope.server';
import { clientIpFromForwardedFor, effectiveRequestHost } from './request-context';

/**
 * Custom server entry. Wraps TanStack Start's request handler to add
 * custom-domain serving: a request arriving on a connected, verified custom
 * domain is rewritten to the existing `/sites/:projectId/*` site routes, so the
 * domain serves the published docs at its own root (no redirect, URL preserved).
 * The dashboard's own host and internal/proxy paths are passed through untouched.
 *
 * It also owns the published-site edge concerns:
 *  - robots.txt / sitemap.xml / llms.txt / llms-full.txt at both origins,
 *  - 301 consolidation of secondary origins onto a verified primary domain,
 *  - a shared Cache-Control on public published-site HTML,
 *  - stamping the real visitor IP onto SSR loader fetches (x-nibleaf-client-ip)
 *    so the API rate-limiter doesn't key every SSR render on this container.
 */

const SELF = getApiOrigin();
const startHandler = createStartHandler((context) => {
  const nonce = ssrNonce.getStore();
  if (nonce) {
    context.router.update({ ssr: { ...context.router.options.ssr, nonce } });
  }
  return defaultStreamHandler(context);
});

// Reach the API through the app's own same-origin /api proxy — this is the path
// that works both in the container (where the server is a separate host) and in
// dev, matching how the SSR data loaders fetch.

const ownHosts = new Set(
  [serverEnv.APP_URL, 'localhost:4310', '127.0.0.1:4310'].map(
    (url) =>
      String(url)
        .replace(/^https?:\/\//, '')
        .split('/')[0]
        ?.toLowerCase() ?? '',
  ),
);

const REVISION = process.env.NIBLEAF_REVISION ?? 'development';
const DRAIN_FILE = process.env.NIBLEAF_DRAIN_FILE ?? '/tmp/cms-app-draining';

// ─── Visitor IP forwarding for SSR loader fetches ────────────────────────────
// SSR data loaders fetch the API from THIS process, so without help every page
// render shares the container's one rate-limit bucket. We capture the visitor's
// IP per request (AsyncLocalStorage) and stamp it as `x-nibleaf-client-ip` on
// fetches to our own /api proxy; the API only honours the header when its direct
// peer is a private address (see apps/server/src/middlewares/rate-limit.ts).

// Compact copies of apps/server/src/lib/client-ip.ts (kept in sync manually —
// this entry can't import from the server package).
// ─── Custom-domain host → project resolution ─────────────────────────────────

const cache = new Map<string, { projectId: string | null; at: number }>();
const TTL = 30_000;

async function resolveHost(host: string): Promise<string | null> {
  const hit = cache.get(host);
  if (hit && Date.now() - hit.at < TTL) {
    return hit.projectId;
  }
  try {
    const response = await got(`${SELF}/api/public/domains/resolve?host=${encodeURIComponent(host)}`, {
      headers: internalRequestHeaders(),
      responseType: 'json',
      retry: { limit: 0 },
      throwHttpErrors: false,
    });
    const parsed = z.object({ data: z.object({ projectId: z.string().nullable().optional() }).optional() }).safeParse(response.body);
    const projectId = response.ok && parsed.success ? (parsed.data.data?.projectId ?? null) : null;
    cache.set(host, { projectId, at: Date.now() });
    return projectId;
  } catch {
    return null;
  }
}

// ─── Published-site metadata (privacy + primary domain) ──────────────────────

/** What the edge needs to know about a published site: whether its HTML may be
 *  shared-cached, and which host is its canonical (primary) home. */
interface SiteMeta {
  /** Verified primary custom domain, when configured. */
  primaryDomain: string | null;
  isPrivate: boolean;
}

const siteMetaCache = new Map<string, { meta: SiteMeta | null; at: number }>();
const SITE_META_TTL = 60_000;

/** Fetch (and TTL-cache) the site shell's metadata. Returns null when the site
 *  is unknown/unpublished/private-to-anonymous — callers must then behave
 *  conservatively (no cache header, no redirect). */
async function resolveSiteMeta(projectId: string): Promise<SiteMeta | null> {
  const requestHasCredentials = Boolean(publishedRequestAuth.getStore()?.cookie || publishedRequestAuth.getStore()?.authorization);
  const hit = requestHasCredentials ? undefined : siteMetaCache.get(projectId);
  if (hit && Date.now() - hit.at < SITE_META_TTL) {
    return hit.meta;
  }
  let meta: SiteMeta | null = null;
  try {
    const response = await got(`${SELF}/api/public/sites/${projectId}`, {
      headers: internalRequestHeaders(),
      responseType: 'json',
      retry: { limit: 0 },
      throwHttpErrors: false,
    });
    if (response.ok) {
      const parsed = z
        .object({
          data: z
            .object({
              project: z
                .object({
                  config: z.looseObject({ visibility: z.string().optional() }).nullable().optional(),
                  primaryDomain: z.string().nullable(),
                })
                .optional(),
            })
            .optional(),
        })
        .safeParse(response.body);
      const project = parsed.success ? parsed.data.data?.project : undefined;
      if (project) {
        const primary = project.primaryDomain?.trim().toLowerCase() ?? '';
        meta = {
          primaryDomain: primary || null,
          isPrivate: (project.config as { visibility?: string } | null)?.visibility === 'private',
        };
      }
    }
  } catch {
    // API unreachable — treat as unknown.
  }
  if (siteMetaCache.size > 500) {
    siteMetaCache.clear();
  }
  // Never share-cache credential-dependent metadata or anonymous misses: doing
  // so would let one viewer's state affect another viewer's redirect decision.
  if (!requestHasCredentials && meta && !meta.isPrivate) siteMetaCache.set(projectId, { meta, at: Date.now() });
  return meta;
}

// ─── SEO / machine-readable files ─────────────────────────────────────────────

/** Files served at a custom domain's root (not rewritten into site routes). */
const DOMAIN_SEO_FILE = /^\/(robots\.txt|sitemap\.xml|llms\.txt|llms-full\.txt|changelog\/rss\.xml)$/;
/** The same files under the app origin's /sites/:id/ prefix. */
const APP_SEO_FILE = /^\/sites\/([^/]+)\/(robots\.txt|sitemap\.xml|llms\.txt|llms-full\.txt|changelog\/rss\.xml)$/;

const SEO_CONTENT_TYPE: Record<string, string> = {
  'robots.txt': 'text/plain; charset=utf-8',
  'sitemap.xml': 'application/xml; charset=utf-8',
  'llms.txt': 'text/plain; charset=utf-8',
  'llms-full.txt': 'text/plain; charset=utf-8',
  'pricing.md': 'text/markdown; charset=utf-8',
  'openapi.json': 'application/json; charset=utf-8',
  'changelog/rss.xml': 'application/rss+xml; charset=utf-8',
};

/** Result of proxying a site's SEO document from the API:
 *  - `{ ok: true }`  → a 2xx upstream document, ready to serve;
 *  - `{ ok: false }` → the API answered with an error status (e.g. 404/403 for a
 *    private/unpublished/taken-down site) — the site is NOT crawlable;
 *  - `null`          → the API was unreachable (genuine network error).
 *  The distinction matters: a private site must be kept out of crawlers, not
 *  handed the permissive allow-all fallback that an "API down" case once shared
 *  with it. */
type SeoProxyResult = { ok: true; response: Response } | { ok: false; status: number };

/** Proxy a site's public SEO document from the API, preserving its content type
 *  and cacheability. When `origin` is given (custom-domain serving), absolute
 *  URLs pointing at the internal /sites/:id form are rebased onto the domain
 *  root — same rewrite for sitemap `loc`s and llms.txt page links. Returns null
 *  ONLY on a network error; an upstream error status is surfaced as
 *  `{ ok: false, status }`. */
async function proxySeoDocument(projectId: string, file: string, origin?: string): Promise<SeoProxyResult | null> {
  try {
    const response = await got(`${SELF}/api/public/sites/${projectId}/${file}`, {
      headers: internalRequestHeaders(),
      retry: { limit: 0 },
      throwHttpErrors: false,
    });
    if (!response.ok) return { ok: false, status: response.statusCode };
    let body = response.body;
    if (origin) {
      body = body
        .replace(new RegExp(`https?://[^/]+/sites/${projectId}`, 'g'), origin)
        // robots.txt points at the API-served sitemap; on a domain it lives at the root.
        .replace(new RegExp(`https?://[^/]+/api/public/sites/${projectId}/sitemap\\.xml`, 'g'), `${origin}/sitemap.xml`);
    }
    const headers: Record<string, string> = { 'content-type': SEO_CONTENT_TYPE[file] ?? 'text/plain; charset=utf-8' };
    const cacheControl = response.headers['cache-control'];
    if (cacheControl) headers['cache-control'] = cacheControl;
    return { ok: true, response: new Response(body, { status: 200, headers }) };
  } catch {
    return null;
  }
}

async function proxyPublishedMarkdown(projectId: string, path: string, search: URLSearchParams): Promise<SeoProxyResult | null> {
  try {
    const query = new URLSearchParams({ path });
    const language = search.get('lang');
    if (language) query.set('lang', language);
    const version = path.replace(/^\/+|\/+$/gu, '').split('/')[0];
    if (version) query.set('version', version);
    const response = await got(`${SELF}/api/public/sites/${projectId}/markdown?${query}`, {
      headers: publicMachineRequestHeaders(),
      retry: { limit: 0 },
      throwHttpErrors: false,
    });
    if (!response.ok) return { ok: false, status: response.statusCode };
    const headers: Record<string, string> = { 'content-type': 'text/markdown; charset=utf-8' };
    const cacheControl = response.headers['cache-control'];
    if (cacheControl) headers['cache-control'] = cacheControl;
    return { ok: true, response: new Response(response.body, { status: 200, headers }) };
  } catch {
    return null;
  }
}

const siteMarkdownUnavailableResponse = (origin: string): Response => {
  const response = new Response(
    `# Page not found\n\nThe requested page has no public Markdown representation. Recover from [llms.txt](${origin}/llms.txt).\n`,
    {
      status: 404,
      headers: {
        'cache-control': 'no-store',
        'content-type': 'text/markdown; charset=utf-8',
        'x-robots-tag': 'noindex, nofollow',
      },
    },
  );
  appendVary(response.headers, 'Accept');
  return response;
};

const addMarkdownDiscovery = (response: Response, canonicalUrl: string, llmsUrl: string): Response => {
  const decorated = new Response(response.body, response);
  decorated.headers.set('Link', markdownDiscoveryLinkHeader(canonicalUrl, llmsUrl));
  appendVary(decorated.headers, 'Accept');
  if (decorated.headers.get('content-type')?.startsWith('text/markdown')) {
    decorated.headers.set('Content-Location', markdownAlternateUrl(canonicalUrl));
  }
  return decorated;
};

const llmsUrlForBase = (base: string): string => `${base.replace(/\/+$/u, '')}/llms.txt`;

/** Response for a site whose SEO doc the API refused (private/unpublished/taken
 *  down) or could not deliver (unreachable). We cannot prove the site is public,
 *  so robots.txt gets a restrictive `Disallow: /` (never the permissive
 *  allow-all fallback) and the other machine files 404 — they must not fall
 *  through to the SPA shell and render HTML as sitemap.xml/llms.txt. */
function seoUnavailableResponse(file: string): Response {
  if (file === 'robots.txt') {
    return new Response('User-agent: *\nDisallow: /\n', {
      headers: {
        'cache-control': 'no-store',
        'content-type': 'text/plain; charset=utf-8',
        'x-robots-tag': 'noindex, nofollow',
      },
    });
  }
  return new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });
}

/** Serve robots.txt / sitemap.xml / llms(-full).txt at a custom domain's ROOT,
 *  with URLs rebased from the internal /sites/:id form to the domain root. When
 *  the API refuses (private site) or is unreachable, serves the restrictive
 *  fallback rather than inviting crawlers or leaking the SPA shell. */
async function serveDomainSeo(pathname: string, projectId: string, origin: string): Promise<Response> {
  const file = pathname.slice(1);
  const proxied = await proxySeoDocument(projectId, file, origin);
  if (proxied?.ok) {
    return proxied.response;
  }
  return seoUnavailableResponse(file);
}

/** Proxy an app-origin GET /sites/:id/{robots.txt,sitemap.xml,llms.txt,
 *  llms-full.txt} to the API's public endpoint. These paths are in SKIP (so the
 *  custom-domain rewrite leaves them alone) and would otherwise fall through to
 *  the SPA shell — make them discoverable on the app origin too. */
async function serveAppOriginSeo(pathname: string): Promise<Response | null> {
  const match = APP_SEO_FILE.exec(pathname);
  if (!match) {
    return null;
  }
  const [, projectId, file] = match;
  if (!projectId || !file) {
    return null;
  }
  const proxied = await proxySeoDocument(projectId, file);
  if (proxied?.ok) {
    return proxied.response;
  }
  // Private/unpublished/unreachable — keep these out of the SPA fall-through the
  // same way the custom-domain path does (restrictive robots.txt, else 404).
  return seoUnavailableResponse(file);
}

// CMS is an internal application; no public marketing/SEO artifacts.
function serveRootSeo(pathname: string, _host: string, _bare: string, _request: Request): Response | null {
  if (pathname === '/robots.txt') return new Response('User-agent: *\nDisallow: /\n', { headers: { 'content-type': 'text/plain; charset=utf-8' } });
  if (/^\/(sitemap\.xml|llms(?:-full)?\.txt|pricing(?:\.md)?|openapi\.json)$/.test(pathname)) return new Response('Not found', { status: 404 });
  return null;
}

const designPreview = process.env.CMS_DESIGN_PREVIEW === 'true';
const responsePolicy = (nonce: string) =>
  designPreview ? contentSecurityPolicy(nonce).replace(/frame-ancestors[^;]*(?:;|$)/, 'frame-ancestors *;') : contentSecurityPolicy(nonce);
const APP_SECURITY_HEADERS = {
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
} as const;

/** Custom server responses bypass Nitro route rules, so apply the same baseline
 *  here as a final wrapper. Preserve any stricter route-specific value. */
async function withSecurityHeaders(response: Response | Promise<Response>, nonce: string): Promise<Response> {
  const res = await response;
  try {
    res.headers.set('x-nibleaf-revision', REVISION);
    if (designPreview) res.headers.delete('X-Frame-Options');
    for (const [name, value] of Object.entries(APP_SECURITY_HEADERS)) {
      if (!res.headers.has(name) && !(designPreview && name === 'X-Frame-Options')) {
        res.headers.set(name, value);
      }
    }
    if ((res.headers.get('content-type') || '').includes('text/html')) {
      if (res.status === 404 && !res.headers.has('X-Robots-Tag')) {
        res.headers.set('X-Robots-Tag', 'noindex, nofollow');
      }
      res.headers.set('Content-Security-Policy', responsePolicy(nonce));
      // A CSP nonce must be unique each time the policy is transmitted. Never
      // allow an intermediary to replay HTML and its nonce from a shared cache.
      res.headers.set('cache-control', 'private, no-store');
      return encodePublicRouteManifestResponse(res);
    }
    return res;
  } catch {
    const wrapped = new Response(res.body, res);
    if (designPreview) wrapped.headers.delete('X-Frame-Options');
    wrapped.headers.set('x-nibleaf-revision', REVISION);
    for (const [name, value] of Object.entries(APP_SECURITY_HEADERS)) {
      if (!wrapped.headers.has(name) && !(designPreview && name === 'X-Frame-Options')) {
        wrapped.headers.set(name, value);
      }
    }
    if ((wrapped.headers.get('content-type') || '').includes('text/html')) {
      if (wrapped.status === 404 && !wrapped.headers.has('X-Robots-Tag')) {
        wrapped.headers.set('X-Robots-Tag', 'noindex, nofollow');
      }
      wrapped.headers.set('Content-Security-Policy', responsePolicy(nonce));
      wrapped.headers.set('cache-control', 'private, no-store');
      return encodePublicRouteManifestResponse(wrapped);
    }
    return wrapped;
  }
}

// ─── Request handling ─────────────────────────────────────────────────────────

/** Strip the body for HEAD requests — Node's http server does not do it for us,
 *  and crawlers routinely probe sitemap/llms URLs with HEAD before fetching. */
function withoutHeadBody(response: Response, method: string): Response {
  return method === 'HEAD' ? new Response(null, { status: response.status, headers: response.headers }) : response;
}

const handleRequestInner: RequestHandler<Register> = async (request, ...rest) => {
  const url = new URL(request.url);
  const host = effectiveRequestHost(request, url);
  const bare = host.split(':')[0] ?? '';
  const isCustomDomain =
    Boolean(host) && !ownHosts.has(host) && !ownHosts.has(bare) && !(process.env.CMS_DESIGN_PREVIEW === 'true' && host.endsWith('.e2b.app'));
  const isGetLike = request.method === 'GET' || request.method === 'HEAD';
  // Normalize trailing slashes permanently (/pricing/ → /pricing) — the router
  // would otherwise answer with a temporary 307, which never consolidates link
  // equity. Root '/' and the machine files are unaffected; 308 preserves method.
  if (isGetLike && url.pathname.length > 1 && url.pathname.endsWith('/')) {
    // Fall back to the request's own scheme so a proxy-less self-host on plain
    // http does not get bounced onto an https URL it never served.
    const proto = request.headers.get('x-forwarded-proto') || url.protocol.replace(':', '') || 'https';
    return Response.redirect(`${proto}://${host}${url.pathname.replace(/\/+$/, '')}${url.search}`, 308);
  }

  // Stable `.md` aliases render the same published/marketing document as the
  // canonical HTML path. `/pricing.md` remains its dedicated product artifact.
  const markdownAliasCanonical = isGetLike && canonicalPathFromMarkdownAlias(url.pathname);
  let routedRequest = request;
  if (markdownAliasCanonical) {
    url.pathname = markdownAliasCanonical;
    routedRequest = new Request(url, request);
    routedRequest.headers.set('accept', 'text/markdown');
    routedRequest.headers.set('x-nibleaf-markdown-alias', '1');
  }

  const renderHtml = async (documentRequest: Request): Promise<Response> => {
    const documentUrl = new URL(documentRequest.url);
    if (!(isGetLike && isDocumentPath(documentUrl.pathname))) return startHandler(documentRequest, ...rest);

    const preferred = preferredRepresentation(documentRequest.headers.get('accept'));
    if (!preferred) return notAcceptableHtmlResponse();

    const siteMatch = /^\/sites\/([^/]+)(\/.*)?$/.exec(documentUrl.pathname);
    if (preferred === 'text/markdown') {
      if (!siteMatch?.[1]) return notAcceptableHtmlResponse();
      const projectId = siteMatch[1];
      const routedPath = siteMatch[2] || '/';
      const publicPath = decodePublishedPathname(routedPath);
      const requestOrigin = documentRequest.headers.get('x-nibleaf-site-origin');
      const meta = await resolveSiteMeta(projectId);
      const base = meta?.primaryDomain ? `https://${meta.primaryDomain}` : requestOrigin ? requestOrigin : `${documentUrl.origin}/sites/${projectId}`;
      if (publicPath === null) return siteMarkdownUnavailableResponse(base);
      const proxied = await proxyPublishedMarkdown(projectId, publicPath, documentUrl.searchParams);
      if (!proxied?.ok) return siteMarkdownUnavailableResponse(base);
      const canonicalUrl = documentUrlForBase(base, routedPath, documentUrl.search);
      return withoutHeadBody(addMarkdownDiscovery(proxied.response, canonicalUrl, llmsUrlForBase(base)), documentRequest.method);
    }
    if (!acceptsHtml(documentRequest.headers.get('accept'))) return notAcceptableHtmlResponse();
    const rendered = await startHandler(documentRequest, ...rest);
    if (rendered.status >= 400 || !siteMatch?.[1]) return rendered;
    const meta = await resolveSiteMeta(siteMatch[1]);
    if (!meta || meta.isPrivate) return rendered;
    const requestOrigin = documentRequest.headers.get('x-nibleaf-site-origin');
    const base = meta.primaryDomain ? `https://${meta.primaryDomain}` : requestOrigin ? requestOrigin : `${documentUrl.origin}/sites/${siteMatch[1]}`;
    const routedPath = siteMatch[2] || '/';
    const publicPath = decodePublishedPathname(routedPath);
    if (publicPath === null) return rendered;
    // The public Markdown action owns the complete project/language/page
    // eligibility contract. Only advertise an alternate that it confirms.
    const markdown = await proxyPublishedMarkdown(siteMatch[1], publicPath, documentUrl.searchParams);
    if (!markdown?.ok) return rendered;
    const canonicalUrl = documentUrlForBase(base, routedPath, documentUrl.search);
    return addMarkdownDiscovery(rendered, canonicalUrl, llmsUrlForBase(base));
  };

  const serve = async (): Promise<Response> => {
    if (!isCustomDomain) {
      if (isGetLike) {
        const rootSeo = serveRootSeo(url.pathname, host, bare, request);
        if (rootSeo) {
          return withoutHeadBody(rootSeo, request.method);
        }
        // App-origin robots/sitemap/llms for a site live under /sites/:id/*; serve
        // them from the API (they're in SKIP so they never reach the site routes).
        const seo = await serveAppOriginSeo(url.pathname);
        if (seo) {
          return withoutHeadBody(seo, request.method);
        }
      }
      if (request.method === 'GET') {
        const siteMatch = /^\/sites\/([^/]+)(\/.*)?$/.exec(url.pathname);
        // Never consolidate the machine files (robots/sitemap/llms) — they were
        // handled above; a transient proxy failure must not turn into a 301.
        if (siteMatch?.[1] && !APP_SEO_FILE.test(url.pathname)) {
          const meta = await resolveSiteMeta(siteMatch[1]);
          // Consolidate SEO equity: when a verified primary custom domain exists,
          // 301 the internal /sites/:id URL onto it. Loop-safe: on the primary
          // domain itself the request is a custom-domain request, not this branch.
          if (meta?.primaryDomain && meta.primaryDomain !== bare) {
            return Response.redirect(`https://${meta.primaryDomain}${siteMatch[2] || '/'}${url.search}`, 301);
          }
          return renderHtml(routedRequest);
        }
      }
      return renderHtml(routedRequest);
    }

    // robots/sitemap/llms are served at the domain root (they are not in SKIP,
    // so they'd otherwise be rewritten to a nonexistent /sites/:id route).
    if (isGetLike && DOMAIN_SEO_FILE.test(url.pathname)) {
      const projectId = await resolveHost(bare);
      if (projectId) {
        const proto = request.headers.get('x-forwarded-proto') || 'https';
        // Always resolves to a Response (restrictive fallback for a private or
        // unreachable site) — never fall through to the /sites rewrite, which
        // would render the SPA shell as sitemap.xml/robots.txt.
        return withoutHeadBody(await serveDomainSeo(url.pathname, projectId, `${proto}://${host}`), request.method);
      }
    }
    if (isAppOwnedPath(url.pathname)) {
      return startHandler(routedRequest, ...rest);
    }
    if (!isAppOwnedPath(url.pathname)) {
      const projectId = await resolveHost(bare);
      if (projectId) {
        const meta = await resolveSiteMeta(projectId);
        // A secondary (non-primary) custom domain 301s onto the primary. Only
        // redirect when the hosts actually differ — never from the primary
        // itself, and never for the machine files handled above.
        if (request.method === 'GET' && meta?.primaryDomain && meta.primaryDomain !== bare && !DOMAIN_SEO_FILE.test(url.pathname)) {
          return Response.redirect(`https://${meta.primaryDomain}${url.pathname}${url.search}`, 301);
        }
        url.pathname = `/sites/${projectId}${url.pathname === '/' ? '' : url.pathname}`;
        // Stamp the real domain origin so the SSR head builds canonical/og/hreflang
        // against the custom domain root, not the internal /sites/:id origin.
        const rewritten = new Request(url, routedRequest);
        const proto = request.headers.get('x-forwarded-proto') || 'https';
        rewritten.headers.set('x-nibleaf-site-origin', `${proto}://${host}`);
        return renderHtml(rewritten);
      }
    }
    return new Response('Published site not found.\n', {
      status: 404,
      headers: {
        'cache-control': 'no-store',
        'content-type': 'text/plain; charset=utf-8',
        'x-content-type-options': 'nosniff',
        'x-robots-tag': 'noindex, nofollow',
      },
    });
  };

  // Run inside the visitor-IP context so SSR loader fetches are attributed to
  // the real client (see the fetch patch above).
  const requestAuth: PublishedRequestAuth = {
    ip: clientIpFromForwardedFor(request.headers.get('x-forwarded-for')),
    cookie: request.headers.get('cookie'),
    authorization: request.headers.get('authorization'),
  };
  return publishedRequestAuth.run(requestAuth, serve);
};

const handleRequest: RequestHandler<Register> = async (request, ...rest) => {
  if (new URL(request.url).pathname === '/health') {
    if (existsSync(DRAIN_FILE)) {
      return Response.json(
        { status: 'shutting_down', service: 'app', revision: REVISION },
        { status: 503, headers: { 'cache-control': 'no-store', 'x-nibleaf-revision': REVISION } },
      );
    }
    try {
      const upstream = await got(`${SELF}/api/app/health`, { retry: { limit: 0 }, throwHttpErrors: false, timeout: { request: 5000 } });
      const ready = upstream.statusCode === 200;
      return Response.json(
        { status: ready ? 'ok' : 'unavailable', service: 'app', revision: REVISION },
        { status: ready ? 200 : 503, headers: { 'cache-control': 'no-store', 'x-nibleaf-revision': REVISION } },
      );
    } catch {
      return Response.json(
        { status: 'unavailable', service: 'app', revision: REVISION },
        { status: 503, headers: { 'cache-control': 'no-store', 'x-nibleaf-revision': REVISION } },
      );
    }
  }
  const nonce = randomBytes(18).toString('base64');
  return ssrNonce.run(nonce, () => withSecurityHeaders(handleRequestInner(request, ...rest), nonce));
};

export default { fetch: handleRequest };
