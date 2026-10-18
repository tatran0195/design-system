/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SitesPage } from './sites';

vi.mock('@tanstack/react-router', () => ({
  getRouteApi: () => ({ useSearch: () => ({}) }),
  Link: ({
    to,
    params = {},
    search: _search,
    ...props
  }: ComponentProps<'a'> & { to: string; params?: Record<string, string>; search?: Record<string, string> }) => (
    <a {...props} href={to.replace(/\$(\w+)/g, (_, name: string) => params[name] ?? `$${name}`)} />
  ),
}));
vi.mock('@/entities/project/api', () => ({
  useProjects: () => ({
    isPending: false,
    data: [
      {
        id: 'project-atlas',
        name: 'Atlas Handbook',
        slug: 'engineering-guide',
        description: 'Engineering documentation',
        icon: '📘',
        config: {
          seo: { socialImage: '/assets/atlas-preview.webp' },
          branding: { logoLight: '/assets/atlas-logo.svg' },
          styling: { primaryColor: '#336699' },
        },
        _count: { pages: 12, deployments: 3 },
      },
      { id: 'project-beacon', name: 'Beacon Manual', slug: 'support-library', icon: '📗', config: null, _count: { pages: 7, deployments: 0 } },
    ],
  }),
}));
vi.mock('@/shared/i18n/react', () => ({ useT: () => (key: string) => key }));
vi.mock('@/shared/lib/format', () => ({ useFormatters: () => ({ number: (value: number) => String(value) }) }));
vi.mock('@/features/projects', () => ({
  NewProjectDialog: ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) =>
    open ? (
      <div role="dialog" aria-label="New project">
        <button type="button" onClick={() => onOpenChange(false)}>
          Close
        </button>
      </div>
    ) : null,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('Sites presentation', () => {
  it('renders both projects as stacked articles', () => {
    render(<SitesPage />);

    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(2);
    expect(articles[0]?.parentElement?.classList.contains('flex')).toBe(true);
    expect(articles[0]?.parentElement?.classList.contains('flex-col')).toBe(true);
    expect(articles[1]?.parentElement).toBe(articles[0]?.parentElement);
    for (const [index, name] of ['Atlas Handbook', 'Beacon Manual'].entries()) {
      expect(within(articles[index]).getByRole('heading', { name })).toBeTruthy();
    }
  });

  it('uses configured social imagery and saved project icons instead of fabricated previews', () => {
    render(<SitesPage />);
    const articles = screen.getAllByRole('article');
    expect(within(articles[0]).getByRole('img', { name: 'Atlas Handbook preview' }).getAttribute('src')).toBe('/assets/atlas-preview.webp');
    expect(within(articles[0]).getByText('Engineering documentation')).toBeTruthy();
    expect(within(articles[0]).getByText('dashboard.col.deploys: 3')).toBeTruthy();
    expect(within(articles[1]).getByRole('img', { name: 'Beacon Manual icon' }).textContent).toBe('📗');
  });

  it.each([
    { query: '  ATLAS  ', visible: 'Atlas Handbook', hidden: 'Beacon Manual' },
    { query: 'SUPPORT-LIBRARY', visible: 'Beacon Manual', hidden: 'Atlas Handbook' },
  ])('filters projects by name or slug for "$query"', ({ query, visible, hidden }) => {
    render(<SitesPage />);

    const search = screen.getByRole('searchbox', { name: 'dashboard.search.placeholder' });
    fireEvent.change(search, { target: { value: query } });

    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByRole('heading', { name: visible })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: hidden })).toBeNull();

    fireEvent.change(search, { target: { value: '' } });
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });

  it('links each project to its overview and settings', () => {
    render(<SitesPage />);

    for (const [index, project] of [
      { id: 'project-atlas', name: 'Atlas Handbook', slug: 'engineering-guide' },
      { id: 'project-beacon', name: 'Beacon Manual', slug: 'support-library' },
    ].entries()) {
      const article = within(screen.getAllByRole('article')[index]);
      expect(article.getByRole('link', { name: `/${project.slug}` }).getAttribute('href')).toBe(`/app/projects/${project.id}`);
      expect(article.getByRole('link', { name: 'nav.overview' }).getAttribute('href')).toBe(`/app/projects/${project.id}`);
      expect(article.getByRole('link', { name: `nav.settings: ${project.name}` }).getAttribute('href')).toBe(`/app/projects/${project.id}/settings`);
    }
  });

  it('opens the creation dialog from the new-project action', () => {
    render(<SitesPage />);
    expect(screen.queryByRole('dialog', { name: 'New project' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'dashboard.newProject' }));
    expect(screen.getByRole('dialog', { name: 'New project' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog', { name: 'New project' })).toBeNull();
  });
});
