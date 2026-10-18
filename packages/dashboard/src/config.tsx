'use client';

import { DirectionProvider, TooltipProvider } from '@cms/ui';
import { type AnchorHTMLAttributes, createContext, type ReactNode, type Ref, useContext, useMemo } from 'react';

export type DashboardDirection = 'ltr' | 'rtl';
export type DashboardTranslationValues = Record<string, unknown>;
export type DashboardTranslate = (key: string | readonly string[], values?: DashboardTranslationValues) => string;
export interface DashboardLocation {
  pathname: string;
  search: string;
  hash?: string;
  state?: unknown;
  key?: string;
}
export interface DashboardNavigateOptions {
  replace?: boolean;
  state?: unknown;
}
export interface DashboardRouterAdapter {
  /** Controlled by the host's router. No router library is required here. */
  location?: DashboardLocation;
  navigate?: (href: string | number, options?: DashboardNavigateOptions) => void;
  /** Optional host-owned rendering, e.g. a TanStack Router link. */
  renderLink?: (props: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode; ref?: Ref<HTMLAnchorElement> }) => ReactNode;
}
export interface DashboardProviderProps {
  children: ReactNode;
  locale?: string;
  direction?: DashboardDirection;
  translate?: DashboardTranslate;
  messages?: Record<string, unknown>;
  router?: DashboardRouterAdapter;
  features?: Record<string, boolean>;
  /** A presentation guard, not an authorization/security boundary. Default is deny. */
  authorize?: (permissions: readonly string[], mode: 'all' | 'any') => boolean;
}
export interface DashboardConfig extends Omit<DashboardProviderProps, 'children'> {
  locale: string;
  direction?: DashboardDirection;
  messages: Record<string, unknown>;
  features: Record<string, boolean>;
}
const EMPTY_MESSAGES: Record<string, unknown> = {};
const EMPTY_FEATURES: Record<string, boolean> = {};
const DashboardContext = createContext<DashboardConfig>({ locale: 'en-US', messages: {}, features: {} });

export function DashboardProvider({
  children,
  locale = 'en-US',
  direction,
  translate,
  messages = EMPTY_MESSAGES,
  router,
  features = EMPTY_FEATURES,
  authorize,
}: DashboardProviderProps) {
  const value = useMemo(
    () => ({ locale, direction, translate, messages, router, features, authorize }),
    [locale, direction, translate, messages, router, features, authorize],
  );
  return (
    <DashboardContext.Provider value={value}>
      <DirectionProvider direction={direction ?? 'ltr'}>
        <TooltipProvider>{children}</TooltipProvider>
      </DirectionProvider>
    </DashboardContext.Provider>
  );
}
export const useDashboardConfig = () => useContext(DashboardContext);
export const useDashboardLocale = () => useDashboardConfig().locale;
export function useFeatureFlag(name: string): boolean {
  return useDashboardConfig().features[name] ?? false;
}
export function useDashboardAuthorization() {
  const { authorize } = useDashboardConfig();
  return (permissions: readonly string[], mode: 'all' | 'any' = 'all') => permissions.length === 0 || (authorize?.(permissions, mode) ?? false);
}
