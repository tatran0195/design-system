import type { Locale } from './locales';
import type { MessageKey } from './message-ids';
import { type MessageVariables } from './runtime';

export { translateFn } from './translate';
export declare function useLocale(): {
  locale: 'en' | 'ja' | 'zh-CN';
  setLocale: (next: Locale) => void;
  t: (key: MessageKey, variables?: MessageVariables) => string;
};
export declare const useT: () => (key: MessageKey, variables?: MessageVariables) => string;
