import { OtpInput } from '@cms/ui';
import { getRouteApi, Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';
import { AuthLayout, readPendingInvitation } from '@/features/auth';
import { authClient, signIn, useGetPublicMeta } from '@/features/auth/api';
import { usePayloadForm } from '@/shared/forms/use-payload-form';
import { useOtpResendCountdown } from '@/shared/hooks/use-otp-resend-countdown';
import { useT } from '@/shared/i18n/react';
import { Button } from '@/shared/ui/button';
import { GoogleIcon } from '@/shared/ui/icons/brand';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

const routeApi = getRouteApi('/(auth)/sign-up');
export function SignUpPage() {
  const t = useT();
  const navigate = useNavigate();
  const search = routeApi.useSearch();
  const lockedEmail = Boolean(search.email);
  const authForm = usePayloadForm(
    z.object({ name: z.string().trim().min(1), email: z.string().trim().email(), otp: z.string().regex(/^(?:\d{6})?$/) }),
    { name: '', email: search.email ?? '', otp: '' },
  );
  const [name, setName] = authForm.field('name');
  const [email, setEmail] = authForm.field('email');
  const [otp, setOtp] = authForm.field('otp');
  const [codeSent, setCodeSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { resendIn, resetCountdown, startCountdown } = useOtpResendCountdown();
  const { data: publicMeta } = useGetPublicMeta();
  const googleEnabled = publicMeta?.providers.google ?? false;
  const signupDisabled = publicMeta?.signupDisabled ?? true;

  const normalizedEmail = email.trim().toLowerCase();
  const invitationId = search.invite ?? readPendingInvitation() ?? undefined;
  const firstPublish = search.intent === 'first-publish';
  const afterAuthPath = invitationId ? `/accept-invite/${invitationId}` : firstPublish ? '/app?firstPublish=true' : '/app';

  const finishSignUp = async () => {
    if (invitationId) {
      await navigate({ to: '/accept-invite/$invitationId', params: { invitationId } });
    } else {
      await navigate({ to: '/app', search: firstPublish ? { firstPublish: true } : {} });
    }
  };

  const requestCode = authForm.submit(async (submitted) => {
    const { email } = submitted;
    const normalizedEmail = email.trim().toLowerCase();

    setIsSubmitting(true);
    setError(null);
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({ email: normalizedEmail, type: 'sign-in' });
      if (result.error) {
        setError(result.error.message ?? t('auth.otp.sendError'));
        return;
      }
      setCodeSent(true);
      startCountdown();
    } catch {
      setError(t('auth.otp.sendError'));
    } finally {
      setIsSubmitting(false);
    }
  });

  const verifyCode = authForm.submit(async (submitted) => {
    const { otp, name, email } = submitted;
    const normalizedEmail = email.trim().toLowerCase();

    setIsSubmitting(true);
    setError(null);
    try {
      const result = await authClient.signIn.emailOtp({ email: normalizedEmail, otp: otp.trim(), name: name.trim() });
      if (result.error) {
        setError(result.error.message ?? t('auth.otp.invalid'));
        return;
      }
      await finishSignUp();
    } catch {
      setError(t('auth.otp.invalid'));
    } finally {
      setIsSubmitting(false);
    }
  });

  const signUpWithGoogle = async () => {
    setError(null);
    setIsGoogleSubmitting(true);
    const result = await signIn.social({ provider: 'google', callbackURL: afterAuthPath });
    if (result.error) {
      setError(result.error.message ?? t('auth.signUp.error'));
      setIsGoogleSubmitting(false);
    }
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (codeSent) await verifyCode();
    else await requestCode();
  };

  if (signupDisabled) {
    return (
      <AuthLayout subtitle={t('auth.signUp.subtitle')}>
        <p className="rounded-md border border-border bg-muted/40 px-4 py-3 text-center text-muted-foreground text-sm">
          {t('auth.legal.signupDisabled')}
        </p>
        <footer className="mt-6 border-ui-border-base border-t pt-4 text-center text-sm text-ui-fg-muted leading-5">
          {t('auth.signUp.haveAccount')}{' '}
          <Link
            className="rounded-sm font-medium text-ui-fg-interactive outline-none transition-colors hover:text-ui-fg-interactive-hover focus-visible:ring-2 focus-visible:ring-ui-border-interactive"
            to="/sign-in"
          >
            {t('auth.signIn.submit')}
          </Link>
        </footer>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout subtitle={codeSent ? t('auth.otp.checkEmail', { email: normalizedEmail }) : t('auth.signUp.subtitle')}>
      {!codeSent && googleEnabled ? (
        <>
          <Button
            className="mb-3 w-full gap-2"
            disabled={isGoogleSubmitting || lockedEmail}
            onClick={signUpWithGoogle}
            type="button"
            variant="outline"
          >
            <GoogleIcon className="size-4" />
            {isGoogleSubmitting ? t('auth.google.submitting') : t('auth.google.signUp')}
          </Button>
          <div className="mb-3 flex items-center gap-3 text-ui-fg-muted text-xs leading-5">
            <span aria-hidden="true" className="h-px flex-1 bg-ui-border-base" />
            <span>{t('auth.divider.or')}</span>
            <span aria-hidden="true" className="h-px flex-1 bg-ui-border-base" />
          </div>
        </>
      ) : null}
      <form className="flex w-full flex-col gap-6" onSubmit={submit}>
        {!codeSent ? (
          <>
            <div className="flex flex-col gap-1">
              <Label className="sr-only" htmlFor="name">{t('auth.field.name')}</Label>
              <Input
                autoComplete="name"
                autoFocus
                className="bg-ui-bg-field-component"
                id="name"
                onChange={(event) => setName(event.target.value)}
                placeholder={t('auth.field.name')}
                value={name}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="sr-only" htmlFor="email">{t('auth.field.email')}</Label>
              <Input
                autoComplete="email"
                className="bg-ui-bg-field-component"
                id="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t('auth.field.email')}
                readOnly={lockedEmail}
                type="email"
                value={email}
              />
              {lockedEmail ? <p className="text-muted-foreground text-xs">{t('auth.invite.invitedAs', { email: search.email ?? '' })}</p> : null}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2" dir="ltr">
            <Label htmlFor="otp">{t('auth.otp.label')}</Label>
            <OtpInput
              aria-invalid={Boolean(error)}
              autoFocus
              className="justify-center"
              disabled={isSubmitting}
              id="otp"
              length={6}
              onChange={setOtp}
              onComplete={() => void verifyCode()}
              value={otp}
            />
            <p className="text-center text-muted-foreground text-xs">{t('auth.otp.hint')}</p>
          </div>
        )}
        {error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive text-sm" role="alert">
            {error}
          </p>
        ) : null}
        <Button className="w-full" disabled={isSubmitting || (codeSent ? otp.length !== 6 : !name.trim() || !normalizedEmail)} type="submit">
          {isSubmitting
            ? codeSent
              ? t('auth.otp.verifying')
              : t('auth.otp.sending')
            : codeSent
              ? t('auth.otp.verifyCreate')
              : t('auth.otp.sendCreate')}
        </Button>
        {codeSent ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button
              onClick={() => {
                setCodeSent(false);
                setOtp('');
                setError(null);
                resetCountdown();
              }}
              size="sm"
              type="button"
              variant="ghost"
            >
              <ArrowLeft className="size-4 rtl:-scale-x-100" /> {t('auth.otp.changeDetails')}
            </Button>
            <Button disabled={isSubmitting || resendIn > 0} onClick={requestCode} size="sm" type="button" variant="ghost">
              {resendIn > 0 ? t('auth.otp.resendIn', { seconds: resendIn }) : t('auth.otp.resend')}
            </Button>
          </div>
        ) : null}
      </form>
      {!codeSent ? (
        <footer className="my-6 text-center text-sm text-ui-fg-muted leading-5">
          {t('auth.signUp.haveAccount')}{' '}
          <Link
            className="rounded-sm font-medium text-ui-fg-interactive outline-none transition-colors hover:text-ui-fg-interactive-hover focus-visible:ring-2 focus-visible:ring-ui-border-interactive"
            to="/sign-in"
          >
            {t('auth.signIn.submit')}
          </Link>
        </footer>
      ) : null}
    </AuthLayout>
  );
}
