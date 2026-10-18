import { Heading, Text } from '@cms/ui';
import { type ReactNode, useId } from 'react';
import { useT } from '@/shared/i18n/react';
import { NibleafMark } from '@/shared/ui/brand';
import { InterfaceLanguageButton } from '@/shared/ui/interface-language-dialog';

/** Internal-workspace authentication. No SaaS promotion, plan positioning,
 * deployment-status claims or public legal-consent gate. */
export function AuthLayout({ children, subtitle }: { children: ReactNode; subtitle?: string }) {
  const t = useT();
  const titleId = useId();
  return (
    <main className="relative flex min-h-dvh w-full items-center justify-center bg-ui-bg-subtle text-ui-fg-base">
      <div className="m-4 flex w-full max-w-[280px] flex-col items-center">
        <a
          href="/app"
          className="relative mb-4 flex size-[50px] items-center justify-center rounded-xl bg-ui-button-neutral shadow-buttons-neutral outline-none focus-visible:ring-2 focus-visible:ring-ui-border-interactive"
          aria-label="CMS"
        >
          <NibleafMark className="size-10 rounded-lg" />
        </a>
        <section aria-labelledby={subtitle ? titleId : undefined} className="w-full max-w-[280px]" data-auth-content>
          <header className="mb-4 space-y-1 text-center">
            {subtitle ? (
              <Heading level="h1" className="break-words font-medium text-lg text-ui-fg-base leading-7" id={titleId}>
                {subtitle}
              </Heading>
            ) : null}
            <Text size="small" className="text-center text-ui-fg-subtle">
              {t('dashboard.subtitle')}
            </Text>
          </header>
          {children}
        </section>
        <div className="absolute end-4 top-4">
          <InterfaceLanguageButton />
        </div>
      </div>
    </main>
  );
}
