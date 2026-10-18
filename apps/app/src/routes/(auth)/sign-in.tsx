import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { SignInPage } from '@/features/auth/pages';
export const Route = createFileRoute('/(auth)/sign-in')({
  validateSearch: (search) =>
    z.object({ invite: z.string().optional().catch(undefined), email: z.string().optional().catch(undefined) }).parse(search),
  head: () => ({ meta: [{ title: 'Log in — CMS' }, { name: 'robots', content: 'noindex, nofollow' }] }),
  component: SignInPage,
});
