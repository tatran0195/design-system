'use client';

import { cloneElement, type ReactElement, type ReactNode, useMemo } from 'react';
import { type DashboardTranslate, type DashboardTranslationValues, useDashboardConfig } from './config';
import english from './messages.en.json';
export type TFunction<_Namespace = unknown> = DashboardTranslate;

function lookup(messages: Record<string, unknown>, key: string): string | undefined {
  const direct = messages[key];
  if (typeof direct === 'string') return direct;
  let value: unknown = messages;
  for (const part of key.split('.')) {
    if (!value || typeof value !== 'object') return undefined;
    value = (value as Record<string, unknown>)[part];
  }
  return typeof value === 'string' ? value : undefined;
}
export function createDashboardTranslator({
  locale = 'en-US',
  messages = {},
  translate,
}: {
  locale?: string;
  messages?: Record<string, unknown>;
  translate?: DashboardTranslate;
} = {}): DashboardTranslate {
  const pluralRules = new Intl.PluralRules(locale);
  return (keys, values = {}) => {
    if (translate) return translate(keys, values);
    const candidates = typeof keys === 'string' ? [keys] : keys;
    let text: string | undefined;
    for (const key of candidates) {
      const pluralKey = typeof values.count === 'number' ? `${key}_${pluralRules.select(values.count)}` : key;
      text = lookup(messages, pluralKey) ?? lookup(messages, key) ?? lookup(english, pluralKey) ?? lookup(english, key);
      if (text !== undefined) break;
    }
    text ??=
      typeof values.defaultValue === 'string'
        ? values.defaultValue
        : (candidates[0]?.split('.').pop() ?? '').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ');
    return text.replace(/{{\s*([^}, ]+)(?:,[^}]+)?\s*}}/g, (_, name: string) => String(values[name] ?? ''));
  };
}
export function useTranslation() {
  const { locale, translate, messages } = useDashboardConfig();
  const t = useMemo(() => createDashboardTranslator({ locale, messages, translate }), [locale, messages, translate]);
  return useMemo(() => ({ t, i18n: { language: locale, resolvedLanguage: locale, languages: [locale] }, ready: true }), [t, locale]);
}
/** Minimal safe rich-text interpolation. Never injects translated strings as HTML. */
export function Trans({
  i18nKey,
  values = {},
  count,
  components = [],
  children,
}: {
  i18nKey?: string;
  values?: DashboardTranslationValues;
  count?: number;
  components?: ReactElement[] | Record<string, ReactElement>;
  children?: ReactNode;
}) {
  const { t } = useTranslation();
  if (!i18nKey) return children;
  const text = t(i18nKey, { ...values, ...(count === undefined ? {} : { count }) });
  const fragments: ReactNode[] = [];
  const pattern = /<([\w]+)>(.*?)<\/\1>/gs;
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    fragments.push(text.slice(cursor, match.index));
    const component = Array.isArray(components) ? components[Number(match[1])] : components[match[1]!];
    fragments.push(component ? cloneElement(component, { key: `part-${match.index}` }, match[2]) : match[2]);
    cursor = match.index! + match[0].length;
  }
  fragments.push(text.slice(cursor));
  return <>{fragments}</>;
}

/** Pure English fallback for utilities outside a React tree; pass a translator for another locale. */
export const t = createDashboardTranslator();
