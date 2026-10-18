import { DEFAULT_LOCALE, isRtl, type Locale, resolveLocale } from '@/shared/i18n/locales';

export type { MessageFn, MessageVariables } from '@/shared/i18n/message-types';

const languageListeners = new Set<() => void>();
const COOKIE = 'PARAGLIDE_LOCALE';
let browserLocale: Locale | undefined;
export function getLocale(): Locale {
  if (typeof document !== 'undefined') {
    if (browserLocale) return browserLocale;
    let cookie: string | undefined;
    try {
      cookie = document.cookie.split(';').find((part) => part.trim().startsWith(`${COOKIE}=`));
    } catch {
      /* opaque/third-party document */
    }
    if (cookie) {
      try {
        const locale = resolveLocale(decodeURIComponent(cookie.trim().slice(COOKIE.length + 1)));
        if (locale) return locale;
      } catch {
        /* malformed cookie */
      }
    }
  }
  if (typeof navigator !== 'undefined') {
    for (const preference of navigator.languages ?? [navigator.language]) {
      const locale = resolveLocale(preference);
      if (locale) return locale;
    }
  }
  return DEFAULT_LOCALE;
}
export function subscribeLanguage(listener: () => void): () => void {
  languageListeners.add(listener);
  return () => {
    languageListeners.delete(listener);
  };
}
export async function setLanguage(locale: Locale): Promise<void> {
  if (typeof document !== 'undefined') {
    browserLocale = locale;
    try {
      // biome-ignore lint/suspicious/noDocumentCookie: upstream synchronous Paraglide locale contract; guarded storage with an in-memory fallback
      document.cookie = `${COOKIE}=${encodeURIComponent(locale)}; Path=/; Max-Age=34560000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
    } catch {
      /* third-party/private storage can be unavailable */
    }
  }
  synchronizeDocumentLanguageFn(locale);
  for (const listener of languageListeners) listener();
}
export function synchronizeDocumentLanguageFn(requestedLocale?: Locale): void {
  if (typeof document === 'undefined') return;
  const locale = requestedLocale ?? getLocale();
  document.documentElement.lang = locale;
  document.documentElement.dir = isRtl(locale) ? 'rtl' : 'ltr';
}
