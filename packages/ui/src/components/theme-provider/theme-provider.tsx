'use client';

import { createContext, type ReactNode, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = Exclude<Theme, 'system'>;

export const THEME_STORAGE_KEY = 'cms.theme';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

export interface ThemeProviderProps {
  applyDocumentTheme?: boolean;
  children: ReactNode;
  defaultTheme?: Theme;
  /** Allows a route-owned appearance system to supply its own pre-hydration script. */
  initialThemeScript?: string;
  storageKey?: string;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const isTheme = (value: string | null): value is Theme => value === 'light' || value === 'dark' || value === 'system';

const prefersDark = (): boolean =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches;
const resolveTheme = (theme: Theme): ResolvedTheme => (theme === 'system' ? (prefersDark() ? 'dark' : 'light') : theme);

const applyTheme = (theme: Theme): ResolvedTheme => {
  const resolved = resolveTheme(theme);
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(resolved);
  document.documentElement.style.colorScheme = resolved;
  return resolved;
};

const scriptValue = (value: string): string =>
  JSON.stringify(value).replaceAll('<', '\\u003c').replaceAll('\u2028', '\\u2028').replaceAll('\u2029', '\\u2029');

export function getThemeScript(storageKey = THEME_STORAGE_KEY, defaultTheme: Theme = 'system'): string {
  const key = scriptValue(storageKey);
  const fallback = scriptValue(defaultTheme);
  return `(function(){try{var t;try{t=localStorage.getItem(${key})}catch(_){}if(t!=='light'&&t!=='dark'&&t!=='system'){t=${fallback}}var d=typeof window.matchMedia==='function'&&window.matchMedia('(prefers-color-scheme: dark)').matches;var r=t==='system'?(d?'dark':'light'):t;var e=document.documentElement;e.classList.remove('light','dark');e.classList.add(r);e.style.colorScheme=r}catch(_){}})();`;
}

/**
 * Browsers execute this inline script while parsing server-rendered HTML.
 * React-created script elements never execute in a client-only app and emit a
 * warning, so render the SSR markup as inert HTML there; the provider's layout
 * effect applies the same theme before the first client paint. No router needed.
 */
export function ThemeScript({ children }: { children?: ReactNode }) {
  const script = typeof children === 'string' ? children.replace(/<\/script/gi, '<\\/script') : '';
  return (
    <span
      hidden
      aria-hidden="true"
      data-slot="theme-script"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: `<script>${script}</script>` }}
    />
  );
}

export function ThemeProvider({
  applyDocumentTheme: shouldApplyDocumentTheme = true,
  children,
  defaultTheme = 'system',
  initialThemeScript,
  storageKey = THEME_STORAGE_KEY,
}: ThemeProviderProps) {
  // Keep the first render identical between server and client; resolve storage
  // and media preferences in the layout effect before the client paints.
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [mounted, setMounted] = useState(false);

  useBrowserLayoutEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(storageKey);
    } catch {
      // Storage can be unavailable in privacy-restricted contexts.
    }
    const initialTheme = isTheme(stored) ? stored : defaultTheme;
    setThemeState(initialTheme);
    setResolvedTheme(shouldApplyDocumentTheme ? applyTheme(initialTheme) : resolveTheme(initialTheme));
    setMounted(true);
  }, [defaultTheme, storageKey, shouldApplyDocumentTheme]);

  useBrowserLayoutEffect(() => {
    if (mounted) setResolvedTheme(shouldApplyDocumentTheme ? applyTheme(theme) : resolveTheme(theme));
  }, [mounted, shouldApplyDocumentTheme, theme]);

  useEffect(() => {
    if (!mounted || theme !== 'system' || typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setResolvedTheme(shouldApplyDocumentTheme ? applyTheme('system') : resolveTheme('system'));
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [mounted, shouldApplyDocumentTheme, theme]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey) setThemeState(isTheme(event.newValue) ? event.newValue : defaultTheme);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [storageKey, defaultTheme]);

  const setTheme = useCallback(
    (next: Theme) => {
      try {
        window.localStorage.setItem(storageKey, next);
      } catch {
        // Changing the in-memory theme still works when storage is unavailable.
      }
      setThemeState(next);
    },
    [storageKey],
  );

  const context = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme, setTheme]);
  const script = initialThemeScript ?? (shouldApplyDocumentTheme ? getThemeScript(storageKey, defaultTheme) : undefined);

  return (
    <ThemeContext.Provider value={context}>
      {script ? <ThemeScript>{script}</ThemeScript> : null}
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext) ?? { theme: 'system', resolvedTheme: 'light', setTheme: () => undefined };
}
