import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
if (typeof window !== 'undefined' && !window.matchMedia)
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent: () => false,
    })),
  });
if (!globalThis.ResizeObserver)
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {};
if (typeof Element !== 'undefined' && !Element.prototype.hasPointerCapture) Element.prototype.hasPointerCapture = () => false;
if (typeof Element !== 'undefined' && !Element.prototype.setPointerCapture) Element.prototype.setPointerCapture = () => {};
if (typeof Element !== 'undefined' && !Element.prototype.releasePointerCapture) Element.prototype.releasePointerCapture = () => {};
// jsdom does not implement the browser element-scrolling API used by manual tables.
if (typeof HTMLElement !== 'undefined' && !HTMLElement.prototype.scroll) HTMLElement.prototype.scroll = () => {};
