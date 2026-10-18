import { useCallback, useSyncExternalStore } from 'react';
import type { Locale } from '@/shared/i18n/locales';
import type { MessageKey } from '@/shared/i18n/message-ids';
import { getLocale, type MessageVariables, setLanguage, subscribeLanguage } from '@/shared/i18n/runtime';
import { translateFn } from '@/shared/i18n/translate';

export { translateFn } from '@/shared/i18n/translate';

export function useLocale() {
  const locale = useSyncExternalStore(
    subscribeLanguage,
    () => getLocale() as Locale,
    () => 'en' as Locale,
  );
  const t = useCallback((key: MessageKey, variables?: MessageVariables) => translateFn(key, variables, locale), [locale]);
  const setLocale = useCallback((next: Locale) => {
    void setLanguage(next);
  }, []);
  return { locale, setLocale, t };
}

export const useT = () => useLocale().t;
