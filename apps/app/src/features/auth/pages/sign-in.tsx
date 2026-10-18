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

const routeApi = getRouteApi('/(auth)/sign-in');
export function SignInPage() {
  const t = useT();
  const navigate = useNavigate();
  const search = routeApi.useSearch();
  const authForm = usePayloadForm(z.object({ email: z.string().trim().email(), otp: z.string().regex(/^(?:\d{6})?$/) }), {
    email: search.email ?? '',
    otp: '',
  });
  const [email, setEmail] = authForm.field('email');
  const [otp, setOtp] = authForm.field('otp');
  const [codeSent, setCodeSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { resendIn, resetCountdown, startCountdown } = useOtpResendCountdown();
  const { data: publicMeta } = useGetPublicMeta();
  const googleEnabled = publicMeta?.providers.google ?? false;

  const normalizedEmail = email.trim().toLowerCase();
  const invitationId = search.invite ?? readPendingInvitation() ?? undefined;
  const afterAuthPath = invitationId ? `/accept-invite/${invitationId}` : '/app';

  const finishSignIn = async () => {
    if (invitationId) {
      await navigate({ to: '/accept-invite/$invitationId', params: { invitationId } });
    } else {
      await navigate({ to: '/app' });
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
    const { otp, email } = submitted;
    const normalizedEmail = email.trim().toLowerCase();

    setIsSubmitting(true);
    setError(null);
    try {
      const result = await authClient.signIn.emailOtp({ email: normalizedEmail, otp: otp.trim() });
      if (result.error) {
        setError(result.error.message ?? t('auth.otp.invalid'));
        return;
      }
      await finishSignIn();
    } catch {
      setError(t('auth.otp.invalid'));
    } finally {
      setIsSubmitting(false);
    }
  });

  const signInWithGoogle = async () => {
    setError(null);
    setIsGoogleSubmitting(true);
    const result = await signIn.social({ provider: 'google', callbackURL: afterAuthPath });
    if (result.error) {
      setError(result.error.message ?? t('auth.signIn.error'));
      setIsGoogleSubmitting(false);
    }
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (codeSent) await verifyCode();
    else await requestCode();
  };

  return (
    <AuthLayout subtitle={codeSent ? t('auth.otp.checkEmail', { email: normalizedEmail }) : t('auth.signIn.subtitle')}>
      {!codeSent && googleEnabled ? (
        <>
          <Button className="mb-3 w-full gap-2" disabled={isGoogleSubmitting} onClick={signInWithGoogle} type="button" variant="outline">
            <GoogleIcon className="size-4" />
            {isGoogleSubmitting ? t('auth.google.submitting') : t('auth.google.signIn')}
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
          <div className="flex flex-col gap-1">
            <Label className="sr-only" htmlFor="email">{t('auth.field.email')}</Label>
            <Input
              autoComplete="email"
              autoFocus
              className="bg-ui-bg-field-component"
              id="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t('auth.field.email')}
              type="email"
              value={email}
            />
          </div>
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
        <Button className="w-full" disabled={isSubmitting || (codeSent ? otp.length !== 6 : !normalizedEmail)} type="submit">
          {isSubmitting
            ? codeSent
              ? t('auth.otp.verifying')
              : t('auth.otp.sending')
            : codeSent
              ? t('auth.otp.verifySignIn')
              : t('auth.otp.sendSignIn')}
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
              <ArrowLeft className="size-4 rtl:-scale-x-100" /> {t('auth.otp.differentEmail')}
            </Button>
            <Button disabled={isSubmitting || resendIn > 0} onClick={requestCode} size="sm" type="button" variant="ghost">
              {resendIn > 0 ? t('auth.otp.resendIn', { seconds: resendIn }) : t('auth.otp.resend')}
            </Button>
          </div>
        ) : null}
      </form>
      {!codeSent ? (
        <footer className="my-6 text-center text-sm text-ui-fg-muted leading-5">
          {t('auth.signIn.noAccount')}{' '}
          <Link
            className="rounded-sm font-medium text-ui-fg-interactive outline-none transition-colors hover:text-ui-fg-interactive-hover focus-visible:ring-2 focus-visible:ring-ui-border-interactive"
            to="/sign-up"
          >
            {t('auth.signIn.createOne')}
          </Link>
        </footer>
      ) : null}
    </AuthLayout>
  );
}
