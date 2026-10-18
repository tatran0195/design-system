import { type UseMutationOptions, type UseQueryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateDocPageRequest, DocPage, UpdateDocPageRequest } from '../../types.js';
import { useCmsClient } from '../context.js';
import { queryKeys } from '../query-keys.js';

// ─── useDocPages ──────────────────────────────────────────────────────────────

export function useDocPages(siteId: string, options?: Partial<UseQueryOptions<DocPage[]>>) {
  const client = useCmsClient();
  return useQuery<DocPage[]>({
    queryKey: queryKeys.docs.lists(siteId),
    queryFn: () => client.docs.list(siteId),
    enabled: Boolean(siteId),
    staleTime: 30_000,
    ...options,
  });
}

// ─── useDocPage ───────────────────────────────────────────────────────────────

export function useDocPage(siteId: string, pageId: string, options?: Partial<UseQueryOptions<DocPage>>) {
  const client = useCmsClient();
  return useQuery<DocPage>({
    queryKey: queryKeys.docs.detail(siteId, pageId),
    queryFn: () => client.docs.get(siteId, pageId),
    enabled: Boolean(siteId) && Boolean(pageId),
    staleTime: 30_000,
    ...options,
  });
}

// ─── useDocPageBySlug ─────────────────────────────────────────────────────────

export function useDocPageBySlug(siteId: string, slug: string, options?: Partial<UseQueryOptions<DocPage>>) {
  const client = useCmsClient();
  return useQuery<DocPage>({
    queryKey: queryKeys.docs.bySlug(siteId, slug),
    queryFn: () => client.docs.getBySlug(siteId, slug),
    enabled: Boolean(siteId) && Boolean(slug),
    staleTime: 30_000,
    ...options,
  });
}

// ─── useCreateDocPage ─────────────────────────────────────────────────────────

export function useCreateDocPage(options?: Partial<UseMutationOptions<DocPage, Error, CreateDocPageRequest>>) {
  const client = useCmsClient();
  const qc = useQueryClient();

  return useMutation<DocPage, Error, CreateDocPageRequest>({
    mutationFn: (body) => client.docs.create(body),
    onSuccess(page, ...rest) {
      qc.invalidateQueries({ queryKey: queryKeys.docs.lists(page.site_id) });
      qc.setQueryData<DocPage>(queryKeys.docs.detail(page.site_id, page.id), page);
      options?.onSuccess?.(page, ...rest);
    },
    ...options,
  });
}

// ─── useUpdateDocPage ─────────────────────────────────────────────────────────

interface UpdateDocPageVars {
  siteId: string;
  pageId: string;
  body: UpdateDocPageRequest;
}

export function useUpdateDocPage(options?: Partial<UseMutationOptions<DocPage, Error, UpdateDocPageVars>>) {
  const client = useCmsClient();
  const qc = useQueryClient();

  return useMutation<DocPage, Error, UpdateDocPageVars>({
    mutationFn: ({ siteId, pageId, body }) => client.docs.update(siteId, pageId, body),
    onSuccess(page, ...rest) {
      qc.setQueryData<DocPage>(queryKeys.docs.detail(page.site_id, page.id), page);
      qc.invalidateQueries({ queryKey: queryKeys.docs.lists(page.site_id) });
      options?.onSuccess?.(page, ...rest);
    },
    ...options,
  });
}

// ─── useDeleteDocPage ─────────────────────────────────────────────────────────

interface DeleteDocPageVars {
  siteId: string;
  pageId: string;
}

export function useDeleteDocPage(options?: Partial<UseMutationOptions<void, Error, DeleteDocPageVars>>) {
  const client = useCmsClient();
  const qc = useQueryClient();

  return useMutation<void, Error, DeleteDocPageVars>({
    mutationFn: ({ siteId, pageId }) => client.docs.delete(siteId, pageId),
    onSuccess(_data, { siteId, pageId }, ...rest) {
      qc.removeQueries({ queryKey: queryKeys.docs.detail(siteId, pageId) });
      qc.invalidateQueries({ queryKey: queryKeys.docs.lists(siteId) });
      options?.onSuccess?.(_data, { siteId, pageId }, ...rest);
    },
    ...options,
  });
}
