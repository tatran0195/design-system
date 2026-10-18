// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { getLocale, setLanguage, subscribeLanguage } from '@/shared/i18n/runtime';

afterEach(async () => {
  vi.restoreAllMocks();
  await setLanguage('en');
});
it('keeps Arabic and RTL usable when the preview/browser blocks cookie writes', async () => {
  const listener = vi.fn();
  const unsubscribe = subscribeLanguage(listener);
  vi.spyOn(Document.prototype, 'cookie', 'set').mockImplementation(() => {
    throw new DOMException('Blocked', 'SecurityError');
  });
  await expect(setLanguage('ar')).resolves.toBeUndefined();
  expect(getLocale()).toBe('ar');
  expect(document.documentElement.dir).toBe('rtl');
  expect(document.documentElement.lang).toBe('ar');
  expect(listener).toHaveBeenCalledOnce();
  unsubscribe();
});
