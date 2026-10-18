import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { queryKeys } from '@/integrations/nibleaf/cache-keys';
import { commentSchema } from '@/integrations/nibleaf/contracts/responses/comments';
import type { AiDraftBody } from '@/integrations/nibleaf/contracts/validators/comments';
import type { CreateCommentBody } from '@/integrations/nibleaf/contracts/validators/reader-access';
import { api } from '@/integrations/nibleaf/endpoints';
import { acknowledgementSchema, mutateData } from '@/shared/api/response';

export const useCreateComment = (projectId: string, pageId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateCommentBody) =>
      mutateData(
        await api.app.projects[':projectId'].comments.$post({ param: { projectId }, json: body }),
        'Could not post the comment.',
        z.lazy(() => commentSchema),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.comments.all(projectId, pageId) }),
  });
};

export const useResolveComment = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, resolved }: { id: string; resolved: boolean }) =>
      mutateData(
        await api.app.projects[':projectId'].comments[':id'].$patch({ param: { projectId, id }, json: { resolved } }),
        'Could not update the comment.',
        z.lazy(() => commentSchema),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', projectId] }),
  });
};

export const useDeleteComment = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      mutateData(
        await api.app.projects[':projectId'].comments[':id'].$delete({ param: { projectId, id } }),
        'Could not delete the comment.',
        acknowledgementSchema,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', projectId] }),
  });
};

export const useAiDraft = (projectId: string) =>
  useMutation({
    mutationFn: async (body: AiDraftBody) =>
      mutateData(
        await api.app.projects[':projectId'].ai.$post({ param: { projectId }, json: body }),
        'Could not draft content.',
        z.object({ text: z.string() }),
      ),
  });
