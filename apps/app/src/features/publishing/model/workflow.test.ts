import { describe, expect, it } from 'vitest';
import { activeStep, previousReadyDeployment } from '@/features/publishing/model/progress';
import { changeKey, publishBlocked, summarizeChanges } from '@/features/publishing/model/review';

describe('publishing workflow contracts', () => {
  it('keeps terminal/active pipeline steps explicit', () => {
    expect(
      [undefined, 'PENDING', 'BUILDING', 'FAILED', 'READY'].map((status) =>
        activeStep(status === 'PENDING' || status === 'BUILDING' || status === 'FAILED' || status === 'READY' ? status : undefined),
      ),
    ).toEqual([0, 0, 1, 1, 4]);
  });
  it('chooses only an older successful revision for rollback', () => {
    const current = { id: 'current', status: 'READY', version: 3 } satisfies { id: string; status: 'READY'; version: number };
    const rows = [
      current,
      { id: 'newer', status: 'READY', version: 4 },
      { id: 'failed', status: 'FAILED', version: 2 },
      { id: 'older', status: 'READY', version: 1 },
    ] satisfies Array<{ id: string; status: 'READY' | 'FAILED'; version: number }>;
    expect(previousReadyDeployment(rows, current)?.id).toBe('older');
  });
  it('sorts changes without mutating the response and reports language diversity', () => {
    const rows = [
      { id: 'b', status: 'removed', path: 'z', languageCode: 'en' },
      { id: 'a', status: 'added', path: 'b', languageCode: 'ar' },
      { id: 'c', status: 'added', path: 'a', languageCode: 'en' },
    ] satisfies Array<{ id: string; status: 'added' | 'removed'; path: string; languageCode: string }>;
    expect(summarizeChanges(rows).sorted.map((item) => item.id)).toEqual(['c', 'a', 'b']);
    expect(rows[0]?.id).toBe('b');
    expect(summarizeChanges(rows).multiLang).toBe(true);
    expect(changeKey(rows[0])).toBe('b:removed');
  });
  it('never publishes through a loading, failed or invalid-redirect preflight', () => {
    expect(publishBlocked(true, false, 0)).toBe(true);
    expect(publishBlocked(false, true, 0)).toBe(true);
    expect(publishBlocked(false, false, 1)).toBe(true);
    expect(publishBlocked(false, false, 0)).toBe(false);
  });
});
