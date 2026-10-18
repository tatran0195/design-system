/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SignInPage } from './sign-in';
import { SignUpPage } from './sign-up';

const mocks = vi.hoisted(() => {
  const search: { email?: string; invite?: string; intent?: string } = {};
  return {
    search,
    google: false,
    signupDisabled: false,
    navigate: vi.fn(),
    sendCode: vi.fn(),
    verifyCode: vi.fn(),
    social: vi.fn(),
  };
});

vi.mock('@tanstack/react-router', () => ({
  getRouteApi: () => ({ useSearch: () => mocks.search }),
  useNavigate: () => mocks.navigate,
  Link: ({ to, ...props }: ComponentProps<'a'> & { to: string }) => <a {...props} href={to} />,
}));
vi.mock('@/features/auth', async () => {
  const { AuthLayout } = await import('../components/auth-layout');
  return { AuthLayout, readPendingInvitation: () => null };
});
vi.mock('@/features/auth/api', () => ({
  authClient: { emailOtp: { sendVerificationOtp: mocks.sendCode }, signIn: { emailOtp: mocks.verifyCode } },
  signIn: { social: mocks.social },
  useGetPublicMeta: () => ({ data: { providers: { google: mocks.google }, signupDisabled: mocks.signupDisabled } }),
}));
vi.mock('@/shared/i18n/react', () => ({ useT: () => (key: string) => key }));
vi.mock('@/shared/ui/interface-language-dialog', () => ({
  InterfaceLanguageButton: () => <button type="button">Language</button>,
}));

beforeEach(() => {
  mocks.search = {};
  mocks.google = false;
  mocks.signupDisabled = false;
  mocks.sendCode.mockResolvedValue({});
  mocks.verifyCode.mockResolvedValue({});
  mocks.social.mockResolvedValue({});
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('Auth presentation and OTP flow', () => {
  it.each([
    { Page: SignInPage, title: 'auth.signIn.subtitle', submit: 'auth.otp.sendSignIn', link: '/sign-up' },
    { Page: SignUpPage, title: 'auth.signUp.subtitle', submit: 'auth.otp.sendCreate', link: '/sign-in' },
  ])('renders $title with labeled email, full-width action and a quiet footer', ({ Page, title, submit, link }) => {
    const { container } = render(<Page />);
    expect(screen.getByRole('region', { name: title }).closest('main')).toBeTruthy();
    expect(screen.getByLabelText('auth.field.email').getAttribute('type')).toBe('email');
    expect(screen.getByRole('button', { name: submit }).classList.contains('w-full')).toBe(true);
    expect(container.querySelector(`footer a[href="${link}"]`)).toBeTruthy();
    expect(container.querySelector('form')?.classList.contains('gap-6')).toBe(true);
    expect(screen.getByLabelText('auth.field.email').hasAttribute('required')).toBe(false);
    expect(container.querySelector('label[for="email"]')?.classList.contains('sr-only')).toBe(true);
    expect(container.querySelector('input[type="password"]')).toBeNull();
    expect(container.querySelector('input[type="checkbox"]')).toBeNull();
    expect(screen.queryByRole('button', { name: /auth.google/ })).toBeNull();
  });

  it('preserves login OTP requests, recovery and invitation return navigation', async () => {
    mocks.search = { email: 'Member@Company.com', invite: 'invite-1' };
    render(<SignInPage />);
    fireEvent.click(screen.getByRole('button', { name: 'auth.otp.sendSignIn' }));
    await waitFor(() => expect(mocks.sendCode).toHaveBeenCalledWith({ email: 'member@company.com', type: 'sign-in' }));
    await screen.findByRole('button', { name: 'auth.otp.verifySignIn' });
    expect(screen.getByRole('button', { name: 'auth.otp.resendIn' }).hasAttribute('disabled')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'auth.otp.differentEmail' }));
    expect(screen.getByLabelText('auth.field.email').getAttribute('value')).toBe('Member@Company.com');
    fireEvent.click(screen.getByRole('button', { name: 'auth.otp.sendSignIn' }));
    await screen.findByRole('button', { name: 'auth.otp.verifySignIn' });
    const digits = screen.getAllByRole('textbox');
    for (const [index, digit] of ['1', '2', '3', '4', '5', '6'].entries()) {
      fireEvent.change(digits[index], { target: { value: digit } });
    }
    await waitFor(() => expect(mocks.verifyCode).toHaveBeenCalledWith({ email: 'member@company.com', otp: '123456' }));
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith({ to: '/accept-invite/$invitationId', params: { invitationId: 'invite-1' } }));
  });

  it('keeps invited signup email locked and submits the original name/email/OTP payload', async () => {
    mocks.search = { email: 'Invitee@Company.com', invite: 'invite-2' };
    mocks.google = true;
    render(<SignUpPage />);
    expect(screen.getByLabelText('auth.field.email').hasAttribute('readonly')).toBe(true);
    expect(screen.getByRole('button', { name: 'auth.google.signUp' }).hasAttribute('disabled')).toBe(true);
    fireEvent.change(screen.getByLabelText('auth.field.name'), { target: { value: 'Ada Lovelace' } });
    fireEvent.click(screen.getByRole('button', { name: 'auth.otp.sendCreate' }));
    await screen.findByRole('button', { name: 'auth.otp.verifyCreate' });
    const digits = screen.getAllByRole('textbox');
    for (const [index, digit] of ['6', '5', '4', '3', '2', '1'].entries()) {
      fireEvent.change(digits[index], { target: { value: digit } });
    }
    await waitFor(() => expect(mocks.verifyCode).toHaveBeenCalledWith({ email: 'invitee@company.com', name: 'Ada Lovelace', otp: '654321' }));
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith({ to: '/accept-invite/$invitationId', params: { invitationId: 'invite-2' } }));
  });

  it('shows Google only when enabled and retains the callback path', async () => {
    mocks.google = true;
    mocks.search = { invite: 'invite-google' };
    render(<SignInPage />);
    fireEvent.click(screen.getByRole('button', { name: 'auth.google.signIn' }));
    await waitFor(() => expect(mocks.social).toHaveBeenCalledWith({ provider: 'google', callbackURL: '/accept-invite/invite-google' }));
  });

  it('keeps signup-disabled presentation free of registration inputs', () => {
    mocks.signupDisabled = true;
    render(<SignUpPage />);
    expect(screen.getByText('auth.legal.signupDisabled')).toBeTruthy();
    expect(screen.queryByLabelText('auth.field.email')).toBeNull();
    expect(screen.getByRole('link', { name: 'auth.signIn.submit' }).getAttribute('href')).toBe('/sign-in');
  });
});
