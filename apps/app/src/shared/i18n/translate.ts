import { type Locale, resolveLocale } from '@/shared/i18n/locales';
import { MESSAGE_IDS, type MessageKey } from '@/shared/i18n/message-ids';
import type { MessageVariables } from '@/shared/i18n/message-types';
import { getLocale } from '@/shared/i18n/runtime';
import ar from '../../../i18n/messages/ar.json';
import bn from '../../../i18n/messages/bn.json';
import de from '../../../i18n/messages/de.json';
import en from '../../../i18n/messages/en.json';
import es from '../../../i18n/messages/es.json';
import fr from '../../../i18n/messages/fr.json';
import hi from '../../../i18n/messages/hi.json';
import id from '../../../i18n/messages/id.json';
import ptBR from '../../../i18n/messages/pt-BR.json';
import ru from '../../../i18n/messages/ru.json';
import ur from '../../../i18n/messages/ur.json';
import zhCN from '../../../i18n/messages/zh-CN.json';

// The pinned upstream catalogs contain only flat strings and named input
// interpolation. Keep every original language and stable message ID without
// importing a compiler/database or generating thousands of runtime modules.
const catalogs: Record<Locale, Record<string, string>> = { en, ar, bn, de, es, fr, hi, id, 'pt-BR': ptBR, ru, ur, 'zh-CN': zhCN };
export function translateFn(key: MessageKey, variables?: MessageVariables, locale?: Locale): string {
  const language = resolveLocale(locale ?? getLocale()) ?? 'en';
  const name = MESSAGE_IDS[key];
  const message = catalogs[language][name] ?? catalogs.en[name] ?? key;
  return message.replace(/\{([A-Za-z_][A-Za-z_0-9]*)\}/g, (placeholder, input: string) =>
    variables && Object.hasOwn(variables, input) ? String(variables[input]) : placeholder,
  );
}
