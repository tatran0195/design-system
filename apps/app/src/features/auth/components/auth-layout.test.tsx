/** @vitest-environment jsdom */

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthLayout } from './auth-layout';

vi.mock('@/shared/i18n/react', () => ({ useT: () => (key: string) => key }));
vi.mock('@/shared/ui/interface-language-dialog', () => ({
  InterfaceLanguageButton: () => <button type="button">Language</button>,
}));

afterEach(cleanup);

describe('AuthLayout', () => {
  it.each(['auth.signIn.subtitle', 'auth.signUp.subtitle'])('presents %s in the compact public layout', (subtitle) => {
    render(
      <AuthLayout subtitle={subtitle}>
        <button type="submit">Continue</button>
      </AuthLayout>,
    );

    const heading = screen.getByRole('heading', { level: 1, name: subtitle });
    expect(heading.classList.contains('text-lg')).toBe(true);
    expect(heading.classList.contains('leading-7')).toBe(true);
    const content = screen.getByRole('region', { name: subtitle });
    expect(content.classList.contains('max-w-[280px]')).toBe(true);
    expect(content.closest('main')).toBe(screen.getByRole('main'));
    expect(content.parentElement?.classList.contains('max-w-[280px]')).toBe(true);
    expect(content.parentElement?.className).not.toMatch(/shadow|ring-|border|bg-/);
    expect(screen.getByRole('link', { name: 'CMS' }).getAttribute('href')).toBe('/app');
    expect(screen.getByRole('button', { name: 'Language' }).closest('section')).toBeNull();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeTruthy();
  });
});
