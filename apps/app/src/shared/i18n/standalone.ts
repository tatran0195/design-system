import { useCallback, useSyncExternalStore } from 'react';
import type { Locale } from '@/shared/i18n/locales';
import { getLocale, type MessageFn, subscribeLanguage, synchronizeDocumentLanguageFn } from '@/shared/i18n/runtime';
import { translateFn } from '@/shared/i18n/translate';

const standaloneMessages = {
  'common.loading': (input, options) => translateFn('common.loading', input, options?.locale),
  'error.badge': (input, options) => translateFn('error.badge', input, options?.locale),
  'error.title': (input, options) => translateFn('error.title', input, options?.locale),
  'error.unexpected': (input, options) => translateFn('error.unexpected', input, options?.locale),
  'error.tryAgain': (input, options) => translateFn('error.tryAgain', input, options?.locale),
  'error.backHome': (input, options) => translateFn('error.backHome', input, options?.locale),
  'notFound.badge': (input, options) => translateFn('notFound.badge', input, options?.locale),
  'notFound.title': (input, options) => translateFn('notFound.title', input, options?.locale),
  'notFound.body': (input, options) => translateFn('notFound.body', input, options?.locale),
  'notFound.backHome': (input, options) => translateFn('notFound.backHome', input, options?.locale),
} satisfies Record<string, MessageFn>;

export type StandaloneMessageKey = keyof typeof standaloneMessages;
export const syncStandaloneLocale = synchronizeDocumentLanguageFn;
export const translateStandalone = (key: StandaloneMessageKey, locale = getLocale() as Locale): string =>
  standaloneMessages[key](undefined, { locale });

export const useStandaloneT = () => {
  const locale = useSyncExternalStore(
    subscribeLanguage,
    () => getLocale() as Locale,
    () => 'en' as Locale,
  );
  return useCallback((key: StandaloneMessageKey) => translateStandalone(key, locale), [locale]);
};
