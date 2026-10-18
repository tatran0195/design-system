'use client';
import type { ReactNode } from 'react';
import { type INavItem, Navigation } from '../nav-item';
import { Shell, type ShellProps } from '../shell';
export interface SettingsNavigationGroup {
  id: string;
  label: string;
  items: INavItem[];
}
export interface SettingsLayoutProps extends ShellProps {
  groups?: SettingsNavigationGroup[];
  backLink?: ReactNode;
}
export function SettingsLayout({ groups = [], sidebar, backLink, ...props }: SettingsLayoutProps) {
  return (
    <Shell
      {...props}
      sidebar={
        sidebar ?? (
          <div className="flex flex-col gap-6">
            {backLink}
            {groups.map((group) => (
              <section key={group.id} aria-label={group.label}>
                <h2 className="text-ui-fg-muted mb-2 px-2 text-xs font-medium">{group.label}</h2>
                <Navigation items={group.items} label={group.label} />
              </section>
            ))}
          </div>
        )
      }
    />
  );
}
