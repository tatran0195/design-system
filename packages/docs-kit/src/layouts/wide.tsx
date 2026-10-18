import clsx from 'clsx';
import { Breadcrumbs } from '..';
import { RootLayout, type RootLayoutProps } from './root';

export const WideLayout = ({ children, footerComponent, showBreadcrumbs = true, ...props }: RootLayoutProps) => (
  <RootLayout {...props} mainWrapperClasses={clsx(props.mainWrapperClasses, 'mx-auto flex')} contentClassName="w-full">
    <main className={clsx('relative mt-4 w-full flex-1 lg:mt-7')}>
      {showBreadcrumbs && <Breadcrumbs />}
      {children}
      {footerComponent}
    </main>
  </RootLayout>
);
