import { Slot } from '@cms/ui';
import { render, screen } from '@testing-library/react';
import type React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { RootLayout, type RootLayoutSlots } from '../root';

vi.mock('@/components', () => ({
  RootProviders: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Sidebar: () => null,
}));

vi.mock('../main-content', () => ({ MainContentLayout: () => null }));
vi.mock('../../components/AiAssistant/ChatWindow', () => ({ AiAssistantChatWindow: () => null }));
vi.mock('../../components/TechArticleJsonLd', () => ({ TechArticleJsonLd: () => null }));

describe('RootLayout slots', () => {
  test('uses root and nested layout slot overrides', () => {
    const SidebarSlot: RootLayoutSlots['sidebar'] = () => <aside data-testid="custom-sidebar" />;
    const MainContentSlot: RootLayoutSlots['mainContent'] = ({ children, slots }) => (
      <main>
        {children}
        {slots?.mainNav && <slots.mainNav />}
        {slots?.contentMenu && <slots.contentMenu />}
      </main>
    );
    const AiAssistantSlot: RootLayoutSlots['aiAssistant'] = () => <div data-testid="custom-assistant" />;
    const ArticleJsonLdSlot: RootLayoutSlots['articleJsonLd'] = () => <div data-testid="custom-jsonld" />;
    const MainNavSlot: RootLayoutSlots['mainNav'] = () => (
      <Slot.Root className="layout-nav-slot" data-testid="custom-nav">
        <a className="layout-nav-link" href="/">
          CMS Docs
        </a>
      </Slot.Root>
    );
    const ContentMenuSlot: RootLayoutSlots['contentMenu'] = () => <div data-testid="custom-content-menu" />;

    render(
      <RootLayout
        ProvidersComponent={({ children }) => <>{children}</>}
        slots={{
          sidebar: SidebarSlot,
          mainContent: MainContentSlot,
          aiAssistant: AiAssistantSlot,
          articleJsonLd: ArticleJsonLdSlot,
          mainNav: MainNavSlot,
          contentMenu: ContentMenuSlot,
        }}
      >
        <p>Documentation page</p>
      </RootLayout>,
    );

    expect(screen.getByTestId('custom-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('custom-assistant')).toBeInTheDocument();
    expect(screen.getByTestId('custom-jsonld')).toBeInTheDocument();
    expect(screen.getByTestId('custom-nav')).toHaveClass('layout-nav-slot', 'layout-nav-link');
    expect(screen.getByRole('link', { name: 'CMS Docs' })).toHaveAttribute('href', '/');
    expect(screen.getByTestId('custom-content-menu')).toBeInTheDocument();
    expect(screen.getByText('Documentation page')).toBeInTheDocument();
  });
});
