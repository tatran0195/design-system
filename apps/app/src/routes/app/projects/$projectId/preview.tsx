import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { ProjectPreview } from '@/features/reader/pages';
export const Route = createFileRoute('/app/projects/$projectId/preview')({
  component: ProjectPreview,
  validateSearch: (search) =>
    z
      .object({
        branchId: z.string().min(1).optional().catch(undefined),
        languageId: z.string().min(1).optional().catch(undefined),
        pageId: z.string().min(1).optional().catch(undefined),
      })
      .parse(search),
});
