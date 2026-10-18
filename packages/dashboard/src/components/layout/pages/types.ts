import type { ComponentType, ReactNode } from 'react';

export interface WidgetProps {
  before: ComponentType<any>[];
  after: ComponentType<any>[];
}

export interface PageProps<TData extends object> {
  children: ReactNode;
  widgets?: WidgetProps;
  data?: TData;
  showJSON?: boolean;
  showMetadata?: boolean;
  /** Explicit host-owned nested route content. */
  outlet?: ReactNode;
}
