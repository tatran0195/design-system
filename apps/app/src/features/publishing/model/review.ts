import type { PendingChange } from '@/features/publishing/api';

type Change = Pick<PendingChange, 'id' | 'status' | 'path' | 'languageCode'>;
const ORDER: Record<PendingChange['status'], number> = { added: 0, modified: 1, removed: 2 };
export function summarizeChanges<Item extends Change>(changes: readonly Item[]) {
  return {
    sorted: [...changes].sort((a, b) => ORDER[a.status] - ORDER[b.status] || a.path.localeCompare(b.path)),
    multiLang: new Set(changes.map((change) => change.languageCode).filter(Boolean)).size > 1,
  };
}
export function changeKey(change: Pick<Change, 'id' | 'status'>): string {
  return `${change.id}:${change.status}`;
}
export function publishBlocked(loading: boolean, failed: boolean, redirectIssues: number): boolean {
  return loading || failed || redirectIssues > 0;
}
