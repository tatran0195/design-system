import type { ReactNode } from 'react';
import { siteT } from '@/shared/i18n/site';
import { truthyAttr } from './attributes';

function FieldRow({
  name,
  type,
  required,
  defaultValue,
  deprecated,
  children,
  language,
}: {
  name?: string;
  type?: string;
  required?: unknown;
  defaultValue?: string;
  deprecated?: unknown;
  children?: ReactNode;
  language?: string;
}) {
  const t = siteT(language);
  return (
    <div className="border-border border-b py-3 first:pt-0 last:border-b-0">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {name ? <code className="rounded bg-muted px-1.5 py-0.5 font-mono font-semibold text-[0.8rem]">{name}</code> : null}
        {type ? <span className="font-mono text-muted-foreground text-xs">{type}</span> : null}
        {truthyAttr(required) ? (
          <span className="font-medium text-[11px] text-red-600 uppercase tracking-wide dark:text-red-400">{t('required')}</span>
        ) : null}
        {truthyAttr(deprecated) ? (
          <span className="font-medium text-[11px] text-amber-600 uppercase tracking-wide dark:text-amber-400">{t('deprecated')}</span>
        ) : null}
        {defaultValue ? (
          <span className="text-muted-foreground text-xs">
            {t('defaultValue')}: <code className="font-mono">{defaultValue}</code>
          </span>
        ) : null}
      </div>
      {children ? <div className="mt-1.5 text-muted-foreground text-sm [&>:first-child]:mt-0 [&>:last-child]:mb-0">{children}</div> : null}
    </div>
  );
}

export function ParamField({
  path,
  query,
  header,
  body,
  name,
  type,
  required,
  default: defaultValue,
  deprecated,
  children,
  language,
}: {
  path?: string;
  query?: string;
  header?: string;
  body?: string;
  name?: string;
  type?: string;
  required?: unknown;
  default?: string;
  deprecated?: unknown;
  children?: ReactNode;
  language?: string;
}) {
  return (
    <FieldRow
      name={path ?? query ?? header ?? body ?? name}
      type={type}
      required={required}
      defaultValue={defaultValue}
      deprecated={deprecated}
      language={language}
    >
      {children}
    </FieldRow>
  );
}

export function ResponseField({
  name,
  type,
  required,
  default: defaultValue,
  deprecated,
  children,
  language,
}: {
  name?: string;
  type?: string;
  required?: unknown;
  default?: string;
  deprecated?: unknown;
  children?: ReactNode;
  language?: string;
}) {
  return (
    <FieldRow name={name} type={type} required={required} defaultValue={defaultValue} deprecated={deprecated} language={language}>
      {children}
    </FieldRow>
  );
}
