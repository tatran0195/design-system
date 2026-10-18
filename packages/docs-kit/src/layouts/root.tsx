import clsx from 'clsx';
import type React from 'react';
import { RootProviders, Sidebar, type SidebarProps } from '@/components';
import { AiAssistantChatWindow } from '../components/AiAssistant/ChatWindow';
import { TechArticleJsonLd } from '../components/TechArticleJsonLd';
import { MainContentLayout, type MainContentLayoutProps, type MainContentLayoutSlots } from './main-content';

export type RootLayoutSlots = MainContentLayoutSlots & {
  sidebar: React.ComponentType<SidebarProps>;
  mainContent: React.ComponentType<MainContentLayoutProps>;
  aiAssistant: React.ComponentType;
  articleJsonLd: React.ComponentType;
};

export type RootLayoutProps = {
  bodyClassName?: string;
  sidebarProps?: SidebarProps;
  showBreadcrumbs?: boolean;
  ProvidersComponent: React.FC<{ children: React.ReactNode }>;
  footerComponent?: React.ReactNode;
  slots?: Partial<RootLayoutSlots>;
} & MainContentLayoutProps;

export const RootLayout = ({ bodyClassName, sidebarProps, ProvidersComponent, slots: slotOverrides, ...mainProps }: RootLayoutProps) => {
  const SidebarSlot = slotOverrides?.sidebar ?? Sidebar;
  const MainContentSlot = slotOverrides?.mainContent ?? MainContentLayout;
  const AiAssistantSlot = slotOverrides?.aiAssistant ?? AiAssistantChatWindow;
  const ArticleJsonLdSlot = slotOverrides?.articleJsonLd ?? TechArticleJsonLd;
  const mainContentSlots = {
    mainNav: slotOverrides?.mainNav,
    contentMenu: slotOverrides?.contentMenu,
  };

  return (
    <body className={clsx('h-screen w-full overflow-hidden')}>
      <div
        className={clsx(
          'bg-cms-bg-subtle font-base text-medium w-full',
          'text-cms-fg-base',
          'h-full overflow-hidden',
          'grid grid-cols-1 lg:mx-auto lg:grid-cols-[221px_1fr]',
          bodyClassName,
        )}
        id="root-layout"
      >
        <RootProviders>
          <ProvidersComponent>
            <SidebarSlot {...sidebarProps} />
            <div className={clsx('relative', 'h-screen', 'flex')}>
              <MainContentSlot {...mainProps} slots={mainContentSlots} />
              <AiAssistantSlot />
            </div>
            <ArticleJsonLdSlot />
          </ProvidersComponent>
        </RootProviders>
      </div>
    </body>
  );
};
