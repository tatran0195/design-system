export declare const INTERFACE_LOCALES: readonly [
  {
    readonly code: 'en';
    readonly label: 'English';
    readonly native: 'English';
    readonly direction: 'ltr';
  },
  {
    readonly code: 'zh-CN';
    readonly label: 'Chinese (Simplified)';
    readonly native: '简体中文';
    readonly direction: 'ltr';
  },
  {
    readonly code: 'ja';
    readonly label: 'Japanese';
    readonly native: '日本語';
    readonly direction: 'ltr';
  },
];
export type Locale = (typeof INTERFACE_LOCALES)[number]['code'];
export type InterfaceLocale = (typeof INTERFACE_LOCALES)[number];
export type Direction = InterfaceLocale['direction'];
export declare const DEFAULT_LOCALE: 'en';
export declare const REQUEST_LOCALE_HEADER = 'x-cms-locale';
export declare const RTL_LOCALES: Set<'en' | 'ja' | 'zh-CN'>;
export declare const resolveLocale: (value?: string | null) => Locale | null;
/** Resolve the interface locale sent by Paraglide, then fall back to the
 * browser's standard language preferences for clients that do not set it. */
export declare const resolveRequestLocale: (headers?: Headers | null) => Locale;
export declare const isRtl: (locale: Locale) => boolean;
export declare const isSupportedLocale: (value: string) => value is Locale;
