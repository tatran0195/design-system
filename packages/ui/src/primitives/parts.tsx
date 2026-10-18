'use client';

import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

/** CMS keeps its existing asChild composition and string styles while the
 * behavior, event system, focus management and native states come from Base UI. */
export type PartProps<C extends React.ElementType> = Omit<React.ComponentPropsWithoutRef<C>, 'render' | 'className' | 'style' | 'children'> & {
  asChild?: boolean;
  render?: React.ReactElement;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};
export type ElementState = Record<string, unknown>;
export type ElementProps = Record<string, unknown> & { ref?: React.Ref<HTMLElement> };

function cmsState(state: ElementState): Record<string, unknown> {
  // Stable CMS state selectors, alongside all Base UI-native data attributes.
  const value =
    'indeterminate' in state && state.indeterminate
      ? 'indeterminate'
      : 'checked' in state
        ? state.checked
          ? 'checked'
          : 'unchecked'
        : 'selected' in state
          ? state.selected
            ? 'checked'
            : 'unchecked'
          : 'active' in state
            ? state.active
              ? 'active'
              : 'inactive'
            : 'hidden' in state
              ? state.hidden
                ? 'inactive'
                : 'active'
              : 'open' in state
                ? state.open
                  ? 'open'
                  : 'closed'
                : undefined;
  return { ...(value === undefined ? {} : { 'data-state': value }), ...('side' in state ? { 'data-side': state.side } : {}) };
}

/** Keep the CMS preventDefault convention at the public composition boundary.
 * Native Base UI handlers use preventBaseUIHandler instead. */
function cancellableProps(props: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(props).map(([key, value]) => {
      if (!/^on[A-Z]/.test(key) || typeof value !== 'function') return [key, value];
      return [
        key,
        (...args: unknown[]) => {
          const result = value(...args);
          const event = args[0];
          if (
            event &&
            typeof event === 'object' &&
            'nativeEvent' in event &&
            'defaultPrevented' in event &&
            event.defaultPrevented &&
            'preventBaseUIHandler' in event &&
            typeof event.preventBaseUIHandler === 'function'
          )
            event.preventBaseUIHandler();
          return result;
        },
      ];
    }),
  );
}
function composedChild(child?: React.ReactElement) {
  return child ? React.cloneElement(child, cancellableProps(child.props as Record<string, unknown>)) : undefined;
}

function singleChild(children: React.ReactNode) {
  if (React.Children.count(children) > 1) React.Children.only(children);
  return React.isValidElement(children) ? children : undefined;
}

function PartElement({
  nativeProps,
  state,
  render,
  tag,
}: {
  nativeProps: ElementProps;
  state: ElementState;
  render?: React.ReactElement;
  tag: keyof React.JSX.IntrinsicElements;
}) {
  const { ref, ...props } = nativeProps;
  // Leave the child's own content intact in asChild/render composition.
  if (render && props.children === undefined) delete props.children;
  return useRender({
    defaultTagName: tag,
    render: composedChild(render),
    ref,
    props: { ...props, ...cmsState(props['aria-checked'] === 'mixed' ? { ...state, indeterminate: true } : state) },
  });
}

/** A React-only adapter: no DOM wrappers, cloned primitive portals, or private
 * Base UI imports. Native refs and render composition are managed by useRender. */
export function part<C extends React.ElementType, R = React.ComponentRef<C>>(Primitive: C, tag: keyof React.JSX.IntrinsicElements) {
  return React.forwardRef<R, PartProps<C>>(function CmsPart(allProps, ref) {
    const { asChild, render, children, ...props } = allProps as PartProps<C>;
    const target = asChild ? singleChild(children) : render;
    if (asChild && !target) return null;
    // The only erased boundary is the generic component constructor. Public
    // props/ref types remain tied to the specific Base UI part above.
    const Component = Primitive as React.ElementType;
    return (
      <Component
        {...cancellableProps(props)}
        ref={ref}
        render={(nativeProps: ElementProps, state: ElementState) => <PartElement nativeProps={nativeProps} state={state} render={target} tag={tag} />}
      >
        {asChild ? undefined : children}
      </Component>
    );
  });
}

export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}
/** Base UI useRender replacement for the old polymorphic slot, including refs,
 * event handlers, class/style merging and form-control aria associations. */
export const SlotRoot = React.forwardRef<HTMLElement, SlotProps>(function Slot({ children, ...props }, ref) {
  const child = singleChild(children);
  return useRender({ defaultTagName: 'span', render: composedChild(child), props: cancellableProps(props), ref, enabled: !!child });
});
export const Slot = { Root: SlotRoot };

export interface OutsideEvent extends CustomEvent<{ originalEvent: Event }> {}
export interface SurfaceEvents {
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: OutsideEvent) => void;
  onFocusOutside?: (event: OutsideEvent) => void;
  onInteractOutside?: (event: OutsideEvent) => void;
  onOpenAutoFocus?: (event: Event) => void;
  onCloseAutoFocus?: (event: Event) => void;
}
export interface ChangeDetails {
  reason: string;
  event: Event;
  cancel: () => void;
}
export function surfaceChange(open: boolean, details: ChangeDetails, handlers: SurfaceEvents) {
  if (open) return;
  const target = details.reason === 'focus-out' ? ((details.event as FocusEvent).relatedTarget ?? details.event.target) : details.event.target;
  // Global notifications are not background dismissal targets.
  if (target instanceof globalThis.Element && target.closest('[data-ui-toast-root]')) {
    details.cancel();
    return;
  }
  if (details.reason === 'escape-key') {
    handlers.onEscapeKeyDown?.(details.event as KeyboardEvent);
    if (details.event.defaultPrevented) details.cancel();
  }
  if (details.reason === 'outside-press' || details.reason === 'focus-out') {
    const event = new CustomEvent<{ originalEvent: Event }>('cms.interactOutside', { cancelable: true, detail: { originalEvent: details.event } });
    if (details.reason === 'outside-press') handlers.onPointerDownOutside?.(event);
    else handlers.onFocusOutside?.(event);
    handlers.onInteractOutside?.(event);
    if (event.defaultPrevented) details.cancel();
  }
}
export function autoFocus(handler?: (event: Event) => void) {
  return () => {
    const event = new Event('cms.autoFocus', { cancelable: true });
    handler?.(event);
    return !event.defaultPrevented;
  };
}

/** Render-only parts (labels/containers) use the same public Base UI composer. */
export const Element = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement> & { asChild?: boolean; render?: React.ReactElement }>(
  function Element({ asChild, render, children, ...props }, ref) {
    return useRender({
      defaultTagName: 'div',
      render: asChild ? (React.Children.only(children) as React.ReactElement) : render,
      ref,
      props: { ...props, ...(!asChild ? { children } : {}) },
    });
  },
);
