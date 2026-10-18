import { type Locale } from './locales';

export type { MessageFn, MessageVariables } from './message-types';

import { getLocale } from './paraglide/runtime.js';
export declare function subscribeLanguage(listener: () => void): () => void;
export declare function setLanguage(locale: Locale): Promise<void>;
export declare function synchronizeDocumentLanguageFn(requestedLocale?: Locale): void;
export { getLocale };
