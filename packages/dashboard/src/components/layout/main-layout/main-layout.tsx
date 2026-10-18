'use client';
import { type INavItem, Navigation } from '../nav-item';
import { Shell, type ShellProps } from '../shell';
export interface MainLayoutProps extends ShellProps {
  navigation?: INavItem[];
}
export function MainLayout({ navigation = [], sidebar, ...props }: MainLayoutProps) {
  return <Shell {...props} sidebar={sidebar ?? <Navigation items={navigation} />} />;
}
