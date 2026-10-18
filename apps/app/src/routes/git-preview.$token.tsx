import { createFileRoute } from '@tanstack/react-router';
import { GitPreviewPage } from '@/features/git/pages';
import { getGitPreviewFn } from '@/features/reader/server';
import { gitPreviewResponseSchema } from '@/integrations/nibleaf/contracts/responses/operations';
export const Route = createFileRoute('/git-preview/$token')({
  loader: async ({ params }) => gitPreviewResponseSchema.parse(JSON.parse(await getGitPreviewFn({ data: { token: params.token } }))),
  head: () => ({ meta: [{ title: 'Pull request preview · Nibleaf' }, { name: 'robots', content: 'noindex,nofollow' }] }),
  component: GitPreviewPage,
});
