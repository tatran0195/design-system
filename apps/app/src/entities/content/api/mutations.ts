import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import type { Asset } from '@/entities/content/model';
import { queryKeys } from '@/integrations/nibleaf/cache-keys';
import { assetSchema, branchSchema, languageSchema, pageSchema } from '@/integrations/nibleaf/contracts/responses/content';
import { presignedUploadSchema } from '@/integrations/nibleaf/contracts/responses/metadata';
import { inferSafeInlineAssetContentType } from '@/integrations/nibleaf/contracts/validators/assets';
import type { CreateBranchBody, CreatePageBody, ReorderPagesBody, UpdatePageBody } from '@/integrations/nibleaf/contracts/validators/content';
import type { CreateLanguageBody, UpdateLanguageBody } from '@/integrations/nibleaf/contracts/validators/languages';
import { api } from '@/integrations/nibleaf/endpoints';
import { acknowledgementSchema, mutateData } from '@/shared/api/response';

const uploadContentType = (file: File): string => file.type.trim() || inferSafeInlineAssetContentType(file.name) || 'application/octet-stream';

export const useCreatePage = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreatePageBody) =>
      mutateData(
        await api.app.projects[':projectId'].pages.$post({ param: { projectId }, json: body }),
        'Could not create the page.',
        z.lazy(() => pageSchema),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.pages.allForProject(projectId) }),
  });
};

export const useUpdatePage = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ pageId, body }: { pageId: string; body: UpdatePageBody }) =>
      mutateData(
        await api.app.projects[':projectId'].pages[':id'].$patch({ param: { projectId, id: pageId }, json: body }),
        'Could not save the page.',
        z.lazy(() => pageSchema),
      ),
    onSuccess: (_data, { pageId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.pages.allForProject(projectId) });
      qc.invalidateQueries({ queryKey: queryKeys.pages.detail(projectId, pageId) });
    },
  });
};

export const useDeletePage = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pageId: string) =>
      mutateData(
        await api.app.projects[':projectId'].pages[':id'].$delete({ param: { projectId, id: pageId } }),
        'Could not delete the page.',
        acknowledgementSchema,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.pages.allForProject(projectId) }),
  });
};

export const useReorderPages = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: ReorderPagesBody) =>
      mutateData(
        await api.app.projects[':projectId'].pages.reorder.$post({ param: { projectId }, json: body }),
        'Could not reorder pages.',
        acknowledgementSchema,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.pages.allForProject(projectId) }),
  });
};

export const useUploadAsset = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File): Promise<Asset> => {
      const contentType = uploadContentType(file);
      const presign = await mutateData(
        await api.app.projects[':projectId'].assets.presign.$post({
          param: { projectId },
          json: { filename: file.name, contentType, size: file.size },
        }),
        'Could not start the upload.',
        z.lazy(() => presignedUploadSchema),
      );
      const put = await fetch(presign.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': contentType } });
      if (!put.ok) {
        throw new Error('Upload failed.');
      }
      return mutateData(
        await api.app.projects[':projectId'].assets.confirm.$post({
          param: { projectId },
          json: { key: presign.key, contentType, size: file.size },
        }),
        'Could not finalize the upload.',
        z.lazy(() => assetSchema),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.assets.all(projectId) }),
  });
};

export const useCreateLanguage = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateLanguageBody) =>
      mutateData(
        await api.app.projects[':projectId'].languages.$post({ param: { projectId }, json: body }),
        'Could not add the language.',
        z.lazy(() => languageSchema),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.languages.all(projectId) });
      qc.invalidateQueries({ queryKey: queryKeys.pages.allForProject(projectId) });
    },
  });
};

export const useUpdateLanguage = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateLanguageBody }) =>
      mutateData(
        await api.app.projects[':projectId'].languages[':id'].$patch({ param: { projectId, id }, json: body }),
        'Could not update the language.',
        z.lazy(() => languageSchema),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.languages.all(projectId) }),
  });
};

export const useDeleteLanguage = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      mutateData(
        await api.app.projects[':projectId'].languages[':id'].$delete({ param: { projectId, id } }),
        'Could not delete the language.',
        acknowledgementSchema,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.languages.all(projectId) });
      qc.invalidateQueries({ queryKey: queryKeys.pages.allForProject(projectId) });
      qc.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
    },
  });
};

export const useCreateBranch = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateBranchBody) =>
      mutateData(
        await api.app.projects[':projectId'].branches.$post({ param: { projectId }, json: body }),
        'Could not create the branch.',
        z.lazy(() => branchSchema),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.branches.all(projectId) }),
  });
};

export const useMergeBranch = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      mutateData(
        await api.app.projects[':projectId'].branches[':id'].merge.$post({ param: { projectId, id } }),
        'Could not merge the branch.',
        acknowledgementSchema,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.branches.all(projectId) });
      qc.invalidateQueries({ queryKey: queryKeys.pages.allForProject(projectId) });
    },
  });
};
