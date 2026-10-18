import type { Locale } from '@/shared/i18n/locales';

export type MessageVariables = Record<string, string | number>;
export type MessageFn = (input?: MessageVariables, options?: { locale?: Locale }) => string;
