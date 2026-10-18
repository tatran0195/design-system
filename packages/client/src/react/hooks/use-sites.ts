import { type UseMutationOptions, type UseQueryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateSiteRequest, Site, UpdateSiteRequest } from '../../types.js';
import { useCmsClient } from '../context.js';
import { queryKeys } from '../query-keys.js';

// ─── useListSites ─────────────────────────────────────────────────────────────

export function useListSites(options?: Partial<UseQueryOptions<Site[]>>) {
  const client = useCmsClient();
  return useQuery<Site[]>({
    queryKey: queryKeys.sites.lists(),
    queryFn: () => client.sites.list(),
    staleTime: 60_000,
    ...options,
  });
}

// ─── useSite ──────────────────────────────────────────────────────────────────

export function useSite(id: string, options?: Partial<UseQueryOptions<Site>>) {
  const client = useCmsClient();
  return useQuery<Site>({
    queryKey: queryKeys.sites.detail(id),
    queryFn: () => client.sites.get(id),
    enabled: Boolean(id),
    staleTime: 60_000,
    ...options,
  });
}

// ─── useCreateSite ────────────────────────────────────────────────────────────

export function useCreateSite(options?: Partial<UseMutationOptions<Site, Error, CreateSiteRequest>>) {
  const client = useCmsClient();
  const qc = useQueryClient();

  return useMutation<Site, Error, CreateSiteRequest>({
    mutationFn: (body) => client.sites.create(body),
    onSuccess(site, ...rest) {
      qc.invalidateQueries({ queryKey: queryKeys.sites.lists() });
      qc.setQueryData<Site>(queryKeys.sites.detail(site.id), site);
      options?.onSuccess?.(site, ...rest);
    },
    ...options,
  });
}

// ─── useUpdateSite ────────────────────────────────────────────────────────────

interface UpdateSiteVars {
  id: string;
  body: UpdateSiteRequest;
}

export function useUpdateSite(options?: Partial<UseMutationOptions<Site, Error, UpdateSiteVars>>) {
  const client = useCmsClient();
  const qc = useQueryClient();

  return useMutation<Site, Error, UpdateSiteVars>({
    mutationFn: ({ id, body }) => client.sites.update(id, body),
    onSuccess(site, ...rest) {
      qc.setQueryData<Site>(queryKeys.sites.detail(site.id), site);
      qc.invalidateQueries({ queryKey: queryKeys.sites.lists() });
      options?.onSuccess?.(site, ...rest);
    },
    ...options,
  });
}

// ─── useDeleteSite ────────────────────────────────────────────────────────────

export function useDeleteSite(options?: Partial<UseMutationOptions<void, Error, string>>) {
  const client = useCmsClient();
  const qc = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => client.sites.delete(id),
    onSuccess(_data, id, ...rest) {
      qc.removeQueries({ queryKey: queryKeys.sites.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.sites.lists() });
      options?.onSuccess?.(_data, id, ...rest);
    },
    ...options,
  });
}
