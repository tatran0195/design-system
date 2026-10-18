'use client';

import { type AnchorHTMLAttributes, forwardRef, type ReactNode, useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';
import { type DashboardLocation, type DashboardNavigateOptions, useDashboardConfig } from './config';
export interface Path {
  pathname: string;
  search: string;
  hash: string;
}
export type To = string | Partial<Path>;
export type NavigateOptions = DashboardNavigateOptions;
export type NavigateFunction = (to: To | number, options?: NavigateOptions) => void;

const NAVIGATE_EVENT = 'cms:dashboard-navigation';
const serverSnapshot = () => '/';
const snapshot = () => (typeof window === 'undefined' ? '/' : `${window.location.pathname}${window.location.search}${window.location.hash}`);
function subscribe(listener: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('popstate', listener);
  window.addEventListener(NAVIGATE_EVENT, listener);
  return () => {
    window.removeEventListener('popstate', listener);
    window.removeEventListener(NAVIGATE_EVENT, listener);
  };
}
export const toHref = (to: To): string =>
  typeof to === 'string'
    ? to
    : `${to.pathname ?? ''}${to.search ? `?${to.search.replace(/^\?/, '')}` : ''}${to.hash ? `#${to.hash.replace(/^#/, '')}` : ''}`;
export function useLocation(): DashboardLocation {
  const { router } = useDashboardConfig();
  const current = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return useMemo(() => {
    if (router?.location) return router.location;
    const url = new URL(current, 'https://cms.invalid');
    return { pathname: url.pathname, search: url.search, hash: url.hash, state: typeof window === 'undefined' ? undefined : window.history.state };
  }, [current, router?.location]);
}
export function useNavigate(): NavigateFunction {
  const { router } = useDashboardConfig();
  return useCallback(
    (to, options) => {
      if (typeof to === 'number') {
        if (router?.navigate) router.navigate(to, options);
        else if (typeof window !== 'undefined') window.history.go(to);
        return;
      }
      const href = toHref(to);
      if (/^\s*(javascript|data|vbscript):/i.test(href)) return;
      if (router?.navigate) {
        router.navigate(href, options);
        return;
      }
      if (typeof window === 'undefined') return;
      const destination = new URL(href, window.location.href);
      if (destination.origin !== window.location.origin) {
        window.location.assign(destination.href);
        return;
      }
      if (options?.replace) window.history.replaceState(options.state ?? null, '', destination);
      else window.history.pushState(options?.state ?? null, '', destination);
      window.dispatchEvent(new Event(NAVIGATE_EVENT));
    },
    [router],
  );
}
export type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  to: To;
  replace?: boolean;
  state?: unknown;
  relative?: string;
  preventScrollReset?: boolean;
  viewTransition?: boolean;
  reloadDocument?: boolean;
};
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function DashboardLink(
  { to, replace, state, relative: _relative, preventScrollReset: _prevent, viewTransition: _view, reloadDocument, onClick, children, ...props },
  ref,
) {
  const navigate = useNavigate();
  const { router } = useDashboardConfig();
  const raw = toHref(to);
  const href = /^\s*(javascript|data|vbscript):/i.test(raw) ? '#' : raw;
  if (router?.renderLink) return <>{router.renderLink({ ...props, href, children, ref, onClick })}</>;
  return (
    <a
      {...props}
      ref={ref}
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.altKey ||
          event.shiftKey ||
          props.target === '_blank' ||
          props.download ||
          reloadDocument
        )
          return;
        event.preventDefault();
        navigate(href, { replace, state });
      }}
    >
      {children}
    </a>
  );
});
export type NavLinkProps = Omit<LinkProps, 'children' | 'className'> & {
  end?: boolean;
  children?: ReactNode | ((state: { isActive: boolean; isPending: boolean }) => ReactNode);
  className?: string | ((state: { isActive: boolean; isPending: boolean }) => string | undefined);
};
export function NavLink({ to, end = false, children, className, ...props }: NavLinkProps) {
  const location = useLocation();
  const path = new URL(toHref(to), 'https://cms.invalid').pathname;
  const isActive = end ? location.pathname === path : location.pathname === path || (path !== '/' && location.pathname.startsWith(`${path}/`));
  const state = { isActive, isPending: false };
  return (
    <Link {...props} to={to} aria-current={isActive ? 'page' : undefined} className={typeof className === 'function' ? className(state) : className}>
      {typeof children === 'function' ? children(state) : children}
    </Link>
  );
}
export function Navigate({ to, replace, state }: { to: To; replace?: boolean; state?: unknown }) {
  const navigate = useNavigate();
  const href = toHref(to);
  useEffect(() => {
    navigate(href, { replace, state });
  }, [navigate, href, replace, state]);
  return null;
}
export function useSearchParams(defaultInit?: ConstructorParameters<typeof URLSearchParams>[0]) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search || defaultInit), [location.search, defaultInit]);
  const setParams = useCallback(
    (next: ConstructorParameters<typeof URLSearchParams>[0] | ((previous: URLSearchParams) => URLSearchParams), options?: NavigateOptions) => {
      const value = typeof next === 'function' ? next(new URLSearchParams(location.search)) : new URLSearchParams(next);
      const search = value.toString();
      navigate({ pathname: location.pathname, search, hash: location.hash }, options);
    },
    [location, navigate],
  );
  return [params, setParams] as const;
}
