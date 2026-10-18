import { env } from '@/integrations/nibleaf/env';
import { siteT } from '@/shared/i18n/site';
import { NibleafMark } from '@/shared/ui/brand';

/**
 * "Made with CMS" attribution + a low-key abuse-report contact, shown in the
 * published-site footer. On by default; site owners can hide it with the
 * `footer.madeWithBadge` config toggle (Site configuration → Footer) — the
 * toggle remains available without plan-based enforcement.
 *
 * Copy is served by the same Paraglide catalog as the rest of the public reader.
 * RTL-safe: flex + gap only, no directional margins.
 */
export function MadeWithBadge({ lang }: { lang?: string }) {
  const t = siteT(lang);
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
      <a
        href={import.meta.env.MODE === 'design' ? '/app' : env.VITE_APP_URL}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
      >
        <NibleafMark className="size-3.5" aria-hidden />
        <span>
          {t('madeWith')} <span className="font-semibold">CMS</span>
        </span>
      </a>
      <span aria-hidden>·</span>
      <a href="mailto:abuse@nibleaf.com" className="transition-colors hover:text-foreground">
        {t('reportAbuse')}
      </a>
    </div>
  );
}
