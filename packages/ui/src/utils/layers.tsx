'use client';

import { type CSSProperties, createContext, type ReactNode, useContext } from 'react';

export type UiLayerKind = 'popover' | 'tooltip' | 'navigation' | 'modal' | 'prompt' | 'toast';
export type UiLayerValue = NonNullable<CSSProperties['zIndex']>;
const LayerContext = createContext<UiLayerValue | undefined>(undefined);
const globalValues = new Set(['auto', 'inherit', 'initial', 'unset', 'revert', 'revert-layer']);

/** Context survives portals: background flyouts stay below dialogs, while a
 * dialog's own flyouts and nested dialogs are raised above their owner.
 * Values reference the shared, customizable @cms/ui/layers.css theme tokens.
 */
export function useUiLayer(kind: UiLayerKind): UiLayerValue {
  const parent = useContext(LayerContext);
  const base = `var(--z-index-ui-${kind})`;
  if (parent === undefined || globalValues.has(String(parent)) || kind === 'toast') return base;
  const offset = kind === 'popover' ? '--ui-layer-popover-offset' : kind === 'tooltip' ? '--ui-layer-tooltip-offset' : '--ui-layer-stack-step';
  return `max(${base}, calc(${parent} + var(${offset})))`;
}

/** Pair a backdrop with its surface; CSS-wide opt-outs are not valid calc operands. */
export function uiLayerBackdrop(layer: UiLayerValue): UiLayerValue {
  return globalValues.has(String(layer)) ? layer : `calc(${layer} - 1)`;
}

export interface UiLayerProps {
  kind: UiLayerKind;
  /** Optional explicit override; descendants follow the same surface. */
  zIndex?: UiLayerValue;
  children: (zIndex: UiLayerValue) => ReactNode;
}

/** A render-prop provider, not a DOM wrapper. Native portal refs, animation
 * presence, focus management, and caller style props remain intact.
 */
export function UiLayer({ kind, zIndex, children }: UiLayerProps) {
  const automatic = useUiLayer(kind);
  const value = zIndex ?? automatic;
  return <LayerContext.Provider value={value}>{children(value)}</LayerContext.Provider>;
}

/** Preserve Base UI's state-dependent style callbacks as well as plain styles. */
export function uiLayerStyle<TState>(
  zIndex: UiLayerValue,
  style?: CSSProperties | ((state: TState) => CSSProperties | undefined),
): CSSProperties | ((state: TState) => CSSProperties) {
  return typeof style === 'function'
    ? (state: TState) => {
        const resolved = style(state);
        return { ...resolved, zIndex: resolved?.zIndex ?? zIndex };
      }
    : { ...style, zIndex: style?.zIndex ?? zIndex };
}
