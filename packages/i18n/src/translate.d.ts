import type { Locale } from './locales';
import { type MessageKey } from './message-ids';
import type { MessageVariables } from './message-types';
export declare function translateFn(key: MessageKey, variables?: MessageVariables, locale?: Locale | (string & {})): string;
