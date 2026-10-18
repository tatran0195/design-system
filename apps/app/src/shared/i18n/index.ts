export * from '@/shared/i18n/locales';
export type { MessageKey } from '@/shared/i18n/message-ids';
export type { MessageFn, MessageVariables } from '@/shared/i18n/message-types';
export { getLocale, setLanguage, subscribeLanguage, synchronizeDocumentLanguageFn } from '@/shared/i18n/runtime';
export { translateFn } from '@/shared/i18n/translate';
