import { z } from 'zod';
import { domainSchema, projectAddonSchema } from '@/integrations/nibleaf/contracts/responses/settings';
import { projectThemeImportResultSchema } from '@/integrations/nibleaf/contracts/responses/theme';
import { acknowledgementSchema } from '@/shared/api/response';

export type { ProjectThemeImportResult } from '@/integrations/nibleaf/contracts/response-models/theme';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/integrations/nibleaf/cache-keys';
import type { UpdateProjectAddonBody } from '@/integrations/nibleaf/contracts/validators/addons';
import type { AddDomainBody } from '@/integrations/nibleaf/contracts/validators/domains';
import type { UpsertOpenApiBody } from '@/integrations/nibleaf/contracts/validators/openapi';
import { api } from '@/integrations/nibleaf/endpoints';
import { ApiResponseError, getData, mutateData } from '@/shared/api/response';

const useSetProjectAddonEnabled = (projectId: string, action: 'activate' | 'deactivate') => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ addonId, expectedRevision }: { addonId: string; expectedRevision: number }) => {
      const response =
        action === 'activate'
          ? await api.app.projects[':projectId'].addons[':addonId'].activate.$post({ param: { projectId, addonId }, json: { expectedRevision } })
          : await api.app.projects[':projectId'].addons[':addonId'].deactivate.$post({ param: { projectId, addonId }, json: { expectedRevision } });
      return mutateData(
        response,
        action === 'activate' ? 'Could not enable the add-on.' : 'Could not disable the add-on.',
        z.lazy(() => projectAddonSchema),
      );
    },
    onSuccess: (addon) => {
      qc.setQueryData(queryKeys.addons.detail(projectId, addon.id), addon);
      qc.invalidateQueries({ queryKey: queryKeys.addons.all(projectId) });
      qc.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
    },
    onError: async (error, variables) => {
      if (error instanceof ApiResponseError && error.code === 'addon:revision_conflict') {
        await Promise.all([
          qc.invalidateQueries({ queryKey: queryKeys.addons.detail(projectId, variables.addonId), exact: true, refetchType: 'all' }),
          qc.invalidateQueries({ queryKey: queryKeys.addons.all(projectId), exact: true, refetchType: 'all' }),
        ]);
      }
    },
  });
};

export const useExportProjectTheme = (projectId: string) =>
  useMutation({
    mutationFn: async () =>
      getData(await api.app.projects[':id']['theme-template'].$get({ param: { id: projectId } }), 'theme template', z.object({ json: z.string() })),
  });

export const useImportProjectTheme = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ template, mode, apply }: { template: unknown; mode: 'merge' | 'replace'; apply: boolean }) =>
      mutateData(
        await api.app.projects[':id']['theme-template'].import.$post({
          param: { id: projectId },
          json: { template, mode, apply },
        }),
        apply ? 'Could not apply the theme template.' : 'Could not validate the theme template.',
        z.lazy(() => projectThemeImportResultSchema),
      ),
    onSuccess: (_, variables) => {
      if (!variables.apply) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
    },
  });
};

export const useUpsertOpenApi = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpsertOpenApiBody) =>
      mutateData(
        await api.app.projects[':projectId'].openapi.$put({ param: { projectId }, json: body }),
        'Could not save the OpenAPI document.',
        acknowledgementSchema,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.openapi.detail(projectId) }),
  });
};

export const useSyncOpenApi = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      mutateData(
        await api.app.projects[':projectId'].openapi.sync.$post({ param: { projectId } }),
        'Could not refresh the OpenAPI document.',
        acknowledgementSchema,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.openapi.detail(projectId) }),
  });
};

export const useDeleteOpenApi = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      mutateData(
        await api.app.projects[':projectId'].openapi.$delete({ param: { projectId } }),
        'Could not remove the OpenAPI document.',
        acknowledgementSchema,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.openapi.detail(projectId) }),
  });
};

export const useAddDomain = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: AddDomainBody) =>
      mutateData(
        await api.app.projects[':projectId'].domains.$post({ param: { projectId }, json: body }),
        'Could not add the domain.',
        acknowledgementSchema,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.domains.all(projectId) }),
  });
};

export const useVerifyDomain = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      mutateData(
        await api.app.projects[':projectId'].domains[':id'].verify.$post({ param: { projectId, id } }),
        'Could not verify.',
        z.lazy(() => domainSchema),
      ),
    // Failed checks persist their actionable status before returning an error,
    // so refresh the row on both success and failure.
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.domains.all(projectId) }),
  });
};

export const useSetPrimaryDomain = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      mutateData(
        await api.app.projects[':projectId'].domains[':id'].primary.$post({ param: { projectId, id } }),
        'Could not set the primary domain.',
        acknowledgementSchema,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.domains.all(projectId) }),
  });
};

export const useDeleteDomain = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      mutateData(
        await api.app.projects[':projectId'].domains[':id'].$delete({ param: { projectId, id } }),
        'Could not remove the domain.',
        acknowledgementSchema,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.domains.all(projectId) }),
  });
};

export const useUpdateProjectAddon = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ addonId, body }: { addonId: string; body: UpdateProjectAddonBody }) =>
      mutateData(
        await api.app.projects[':projectId'].addons[':addonId'].$patch({ param: { projectId, addonId }, json: body }),
        'Could not update the add-on.',
        z.lazy(() => projectAddonSchema),
      ),
    onSuccess: (addon) => {
      qc.setQueryData(queryKeys.addons.detail(projectId, addon.id), addon);
      qc.invalidateQueries({ queryKey: queryKeys.addons.all(projectId) });
      qc.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
    },
    onError: async (error, variables) => {
      if (error instanceof ApiResponseError && error.code === 'addon:revision_conflict') {
        await Promise.all([
          qc.invalidateQueries({ queryKey: queryKeys.addons.detail(projectId, variables.addonId), exact: true, refetchType: 'all' }),
          qc.invalidateQueries({ queryKey: queryKeys.addons.all(projectId), exact: true, refetchType: 'all' }),
        ]);
      }
    },
  });
};

export const useActivateProjectAddon = (projectId: string) => useSetProjectAddonEnabled(projectId, 'activate');

export const useDeactivateProjectAddon = (projectId: string) => useSetProjectAddonEnabled(projectId, 'deactivate');
