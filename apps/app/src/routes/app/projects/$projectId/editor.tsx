import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { EditorPage } from '@/features/editor/pages';
export const Route = createFileRoute('/app/projects/$projectId/editor')({
  component: EditorPage,
  // Deep links from the dashboard: `?page=<id>` opens a specific page (e.g. a
  // publish-check issue), `?publish=true` opens the publish flow directly.
  validateSearch: (search) =>
    z
      .object({
        firstPublish: z.preprocess((value) => (value === true || value === 'true' || value === '1' ? true : undefined), z.literal(true).optional()),
        page: z.string().min(1).optional().catch(undefined),
        publish: z.preprocess((value) => (value === true || value === 'true' || value === '1' ? true : undefined), z.literal(true).optional()),
      })
      .parse(search),
});
