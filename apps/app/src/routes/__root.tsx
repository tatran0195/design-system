import { getThemeScript, ThemeProvider } from '@cms/ui';
import { createRootRoute, HeadContent, Outlet, Scripts, useRouter, useRouterState } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { z } from 'zod';
import { siteThemeNoFlashScript } from '@/features/reader/appearance';
import appCss from '@/styles/styles.css?url';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'CMS — documentation workspace' },
      { name: 'application-name', content: 'CMS' },
      { name: 'theme-color', content: '#18181b' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
      { rel: 'manifest', href: '/site.webmanifest' },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  const nonce = useRouter().options.ssr?.nonce;
  const { lang, dir, siteProjectId, siteThemeDefault } = useRouterState({ select: selectDocumentState });
  const bootstrap = siteProjectId ? siteThemeNoFlashScript(siteProjectId, siteThemeDefault ?? 'light') : undefined;
  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <head>
        {nonce && <meta property="csp-nonce" content={nonce} />}
        {siteProjectId && <meta name="nibleaf-site-project" content={siteProjectId} />}
        <script nonce={nonce}>{bootstrap ?? getThemeScript()}</script>
        <HeadContent />
      </head>
      <body>
        {import.meta.env.MODE === 'design' && (
          <div
            role="status"
            className="fixed bottom-3 start-1/2 z-40 -translate-x-1/2 rounded-full border border-ui-border-base bg-ui-bg-base px-4 py-2 text-xs text-ui-fg-subtle shadow-lg rtl:translate-x-1/2"
          >
            MSW mock preview · no real data · demo OTP 123456 ·{' '}
            <form className="inline" method="post" action="/api/__design/session?state=off">
              <button className="underline" type="submit">
                Sign-in screen
              </button>
            </form>
          </div>
        )}
        <ThemeProvider applyDocumentTheme={!siteProjectId} initialThemeScript="">
          {children}
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}

const documentSite = z.object({
  site: z.object({
    activeLanguage: z.string(),
    languages: z.array(z.object({ code: z.string(), direction: z.enum(['LTR', 'RTL']) })),
    project: z.object({
      id: z.string(),
      config: z.object({ styling: z.object({ theme: z.enum(['light', 'dark', 'system']).optional() }).optional() }).nullish(),
    }),
  }),
});
function selectDocumentState(state: { matches: ReadonlyArray<{ routeId: string; loaderData?: unknown }> }) {
  const result = documentSite.safeParse(state.matches.find((entry) => entry.routeId === '/sites/$projectId')?.loaderData);
  if (!result.success) return { lang: 'en', dir: 'ltr', siteProjectId: undefined, siteThemeDefault: undefined };
  const { site } = result.data;
  return {
    lang: site.activeLanguage,
    dir: site.languages.find((language) => language.code === site.activeLanguage)?.direction === 'RTL' ? 'rtl' : 'ltr',
    siteProjectId: site.project.id,
    siteThemeDefault: site.project.config?.styling?.theme ?? 'light',
  };
}
