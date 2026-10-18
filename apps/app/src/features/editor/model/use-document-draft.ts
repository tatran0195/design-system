import { isDirty, nextHydration, type ServerSnapshot, shouldAutosave } from '@cms/editor';
import { useDebouncedCallback } from '@tanstack/react-pacer';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useUpdatePage } from '@/entities/content/api';
import type { Page } from '@/entities/content/model';
import { draftPreviewHref } from '@/features/reader/links';
import { usePayloadForm } from '@/shared/forms/use-payload-form';
import { useT } from '@/shared/i18n/react';
import { toast } from '@/shared/ui/sonner';
export function useDocumentDraft(projectId: string, page: Page | undefined, activeBranchId: string | null) {
  const t = useT();
  const updatePage = useUpdatePage(projectId);
  const draftForm = usePayloadForm(z.object({ title: z.string(), content: z.string() }), { title: '', content: '' });
  const [title, setTitle] = draftForm.field('title');
  const [content, setContent] = draftForm.field('content');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [synced, setSynced] = useState<ServerSnapshot | null>(null);
  // Load the selected page into the local draft. Re-seed when switching pages, OR
  // when a NEWER server copy arrives while the draft is still clean (matches what
  // we last loaded/saved) — so an external update, a branch reload, or a
  // stale→fresh cache transition refreshes the editor without ever clobbering
  // unsaved edits. This runs during render (React's "adjust state while
  // rendering" pattern) rather than in an effect so no frame is ever committed
  // with a draft that belongs to a different page than `page`: the editor below
  // is keyed by page id and mounts straight onto the right document, and the
  // autosave effect can never observe the previous page's body under the new id.
  const hydration = nextHydration({ synced, draft: { title, content } }, page);
  if (hydration) {
    setSynced(hydration);
    draftForm.reset({ title: hydration.title, content: hydration.content });
    setStatus('idle');
  }

  // Debounced autosave: fire ~700ms after the user stops typing the title/content.
  // `onUnmount` flushes any pending save when the editor unmounts (route change /
  // tab close) so a keystroke made <700ms before leaving isn't dropped.
  const saveDraft = useDebouncedCallback(
    (pageId: string, draft: { title: string; content: string }) => {
      updatePage.mutate(
        { pageId, body: draft },
        {
          onSuccess: (saved) => {
            setStatus('saved');
            // The saved draft is now the synced server state — but only while
            // that page is still the one open; a save that lands after a page
            // switch must not disturb the new page's draft.
            setSynced((current) =>
              current?.id === pageId ? { id: pageId, title: draft.title, content: draft.content, updatedAt: saved.updatedAt } : current,
            );
          },
          onError: () => setStatus('idle'),
        },
      );
    },
    { wait: 700, onUnmount: (d) => d.flush() },
  );

  // Only ever saves to the page the draft was hydrated from, and never an empty
  // body over a non-empty page (see shouldAutosave).
  useEffect(() => {
    if (!page || !shouldAutosave({ synced, draft: { title, content } }, page)) {
      return;
    }
    setStatus('saving');
    saveDraft(page.id, { title, content });
  }, [title, content, page, synced, saveDraft]);

  const openDraftPreview = draftForm.submit(async (submitted) => {
    const { title, content } = submitted;

    // Open synchronously so browsers treat this as a user-initiated popup. We
    // navigate it only after the current draft is safely stored server-side.
    const previewWindow = window.open('about:blank', '_blank');
    if (!previewWindow) {
      toast.error(t('editor.previewPopupBlocked'));
      return;
    }
    previewWindow.opener = null;

    const previewUrl = draftPreviewHref(projectId, {
      branchId: activeBranchId ?? undefined,
      languageId: page?.languageId,
      pageId: page?.id,
    });

    try {
      const draftIsCurrent = page && synced?.id === page.id && !isDirty({ synced, draft: { title, content } });
      if (page && !draftIsCurrent) {
        setStatus('saving');
        const saved = await updatePage.mutateAsync({ pageId: page.id, body: { title, content } });
        setSynced((current) => (current?.id === page.id ? { id: page.id, title, content, updatedAt: saved.updatedAt } : current));
        setStatus('saved');
      }
      previewWindow.location.replace(previewUrl);
    } catch {
      previewWindow.close();
      setStatus('idle');
      toast.error(t('editor.previewSaveError'));
    }
  });

  return { title, setTitle, content, setContent, status, openDraftPreview, clearDraft: () => setSynced(null) };
}
