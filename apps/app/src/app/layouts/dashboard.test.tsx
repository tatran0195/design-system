// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps, ReactNode } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { DashboardLayout } from './dashboard';
import { ProjectLayout } from './project';

const state = vi.hoisted(() => ({ pathname: '/app', locale: 'en', previewEnabled: true }));

vi.mock('@tanstack/react-router', () => ({
  useRouterState: () => state.pathname,
  Link: ({ to, children, params: _params, ...props }: ComponentProps<'a'> & { to: string; children: ReactNode; params?: unknown }) => (
    <a {...props} href={to}>
      {children}
    </a>
  ),
}));
vi.mock('@/shared/i18n/react', () => ({
  useT: () => (key: string) => key,
  useLocale: () => ({ locale: state.locale, t: (key: string) => key }),
}));
vi.mock('@/entities/project/api', () => ({
  useProject: () => ({ data: { name: 'Documentation', config: { addons: { previewDeployments: state.previewEnabled } } } }),
}));
vi.mock('@/features/notifications', () => ({ NotificationsPopover: () => <button type="button">Notifications</button> }));
vi.mock('@/widgets/navigation/sidebar-account-footer', () => ({ SidebarAccountFooter: () => <button type="button">Account</button> }));
vi.mock('@/widgets/navigation/site-switcher', () => ({ SiteSwitcher: () => <button type="button">Switch site</button> }));
vi.mock('@/widgets/navigation/command-palette', () => ({
  CommandPalette: ({ open }: { open: boolean }) => (open ? <div role="dialog" aria-label="Command palette" /> : null),
}));

afterEach(() => {
  cleanup();
  state.pathname = '/app';
  state.locale = 'en';
  state.previewEnabled = true;
});

it('uses one Shell provider, sidebar, footer and content slot with dense navigation', () => {
  const { container } = render(
    <DashboardLayout>
      <h1>Workspace content</h1>
    </DashboardLayout>,
  );
  expect(container.querySelectorAll('[data-slot="sidebar-wrapper"]')).toHaveLength(1);
  expect(container.querySelectorAll('[data-slot="sidebar-content"]')).toHaveLength(1);
  expect(container.querySelectorAll('[data-slot="sidebar-header"]')).toHaveLength(1);
  expect(container.querySelectorAll('[data-slot="sidebar-footer"]')).toHaveLength(1);
  expect(screen.getAllByRole('main')).toHaveLength(1);
  expect(screen.getByText('CMS')).toBeTruthy();
  expect(screen.getAllByRole('button', { name: 'Switch site' })).toHaveLength(1);
  expect(container.querySelector('[data-slot="sidebar-menu-button"]')?.className).toContain('h-8');
  expect(screen.getByRole('heading', { name: 'Workspace content' })).toBeTruthy();
  const trigger = screen.getByRole('button', { name: 'Toggle Sidebar' });
  fireEvent.click(trigger);
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  fireEvent.click(screen.getByRole('button', { name: 'dashboard.search.placeholder' }));
  expect(screen.getByRole('dialog', { name: 'Command palette' })).toBeTruthy();
});

it('uses a compact projects rail with sidebar search and only CMS workspace destinations', () => {
  state.pathname = '/app/sites';
  const { container } = render(<DashboardLayout>Projects</DashboardLayout>);
  expect(container.firstElementChild?.className).toContain('[--sidebar-width:11.75rem!important]');
  expect(screen.getByRole('button', { name: 'Switch site' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'dashboard.search.placeholder' })).toBeTruthy();
  expect(container.querySelector('[data-sidebar="menu-button"][href="/app/sites"]')).toBeTruthy();
  expect(container.querySelector('[data-sidebar="menu-button"][href="/app/analytics"]')).toBeTruthy();
  expect(container.querySelector('[data-sidebar="menu-button"][href="/app/members"]')).toBeTruthy();
  expect(screen.queryByRole('link', { name: /payments|billing/i })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'dashboard.search.placeholder' }));
  expect(screen.getByRole('dialog', { name: 'Command palette' })).toBeTruthy();
});

it('keeps project preview and notifications in the shared shell without nesting sidebars', () => {
  state.pathname = '/app/projects/docs';
  const { container } = render(
    <ProjectLayout projectId="docs">
      <h1>Project content</h1>
    </ProjectLayout>,
  );
  expect(container.querySelectorAll('[data-slot="sidebar-wrapper"]')).toHaveLength(1);
  expect(container.querySelectorAll('[data-slot="sidebar-footer"]')).toHaveLength(1);
  expect(screen.getByText('Documentation')).toBeTruthy();
  expect(screen.getByRole('link', { name: 'project.previewDraftAria' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Notifications' })).toBeTruthy();
});

it('retains the live-site preview fallback', () => {
  state.previewEnabled = false;
  render(<ProjectLayout projectId="docs">Project content</ProjectLayout>);
  expect(screen.getByRole('link', { name: 'project.previewLiveAria' }).getAttribute('href')).toBe('/sites/docs');
});

it('keeps the editor outside the dashboard shell', () => {
  state.pathname = '/app/projects/docs/editor';
  const { container } = render(
    <ProjectLayout projectId="docs">
      <h1>Editor</h1>
    </ProjectLayout>,
  );
  expect(container.querySelector('[data-slot="sidebar-wrapper"]')).toBeNull();
  expect(screen.getByRole('heading', { name: 'Editor' })).toBeTruthy();
});

it('localizes the app-owned sidebar trigger', () => {
  state.locale = 'ja';
  render(<DashboardLayout>Workspace content</DashboardLayout>);
  const trigger = screen.getByRole('button', { name: 'editor.hideSidebar' });
  fireEvent.click(trigger);
  expect(screen.getByRole('button', { name: 'editor.showSidebar' })).toBeTruthy();
});
