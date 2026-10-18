import type { ComponentType, ReactNode } from 'react';
export interface LayoutSection {
  id: string;
  ordering?: 'list' | 'grid' | 'horizontal-list' | 'horizontal-stretched';
  label?: string;
}
export interface LayoutComponentProps {
  sections: Record<string, ReactNode>;
  data?: unknown;
  className?: string;
}
export type LayoutControlSize = 'default' | 'small' | 'xsmall';
export interface LayoutDefinition {
  id: string;
  label?: string;
  sections: LayoutSection[];
  Component: ComponentType<LayoutComponentProps>;
}
export interface WidgetPreference {
  hidden?: boolean;
  section?: string;
  order?: number;
}
export interface LayoutPreference {
  widgets: Record<string, WidgetPreference>;
}
export interface WidgetRenderEntry {
  Component: ComponentType<{ data?: unknown }>;
  widgetId: string;
  section?: string;
}
export type SectionWidgetMap = Record<string, WidgetRenderEntry[]>;
export interface LayoutPersistenceAdapter {
  load: (key: string, signal?: AbortSignal) => Promise<LayoutPreference | null>;
  save: (key: string, preference: LayoutPreference) => Promise<void>;
  remove?: (key: string) => Promise<void>;
}
export const CORE_LAYOUT_IDS = {
  SINGLE_COLUMN: 'single-column',
  SINGLE_ROW: 'single-row',
  TWO_COLUMN: 'two-column',
  SETTINGS_SIDEBAR: 'settings-sidebar',
} as const;
