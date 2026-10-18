import clsx from 'clsx';
import { Breadcrumbs } from '..';
import { RootLayout, type RootLayoutProps } from './root';

export const TightLayout = ({ children, footerComponent, showBreadcrumbs = true, ...props }: RootLayoutProps) => (
  <RootLayout {...props}>
    <div
      className={clsx(
        'w-full h-fit',
        'max-w-inner-content-xs sm:max-w-inner-content-sm md:max-w-inner-content-md',
        'lg:max-w-inner-content-lg xl:max-w-inner-content-xl xxl:max-w-inner-content-xxl',
        'xxxl:max-w-inner-content-xxxl',
        'px-docs_1 md:px-docs_4 lg:px-0',
      )}
    >
      {showBreadcrumbs && <Breadcrumbs />}
      {children}
      {footerComponent}
    </div>
  </RootLayout>
);
