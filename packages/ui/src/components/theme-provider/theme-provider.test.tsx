import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getThemeScript, THEME_STORAGE_KEY, ThemeProvider, ThemeScript, useTheme } from './theme-provider';

function ThemeProbe() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <>
      <output>
        {theme}:{resolvedTheme}
      </output>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('light')}>Light</button>
    </>
  );
}

function mediaQuery(matches = false) {
  const events = new window.EventTarget();
  return {
    matches,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
    dispatchEvent: events.dispatchEvent.bind(events),
  };
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = '';
  document.documentElement.style.colorScheme = '';
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => mediaQuery()),
  );
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('ThemeProvider', () => {
  it('uses the saved theme and persists subsequent choices', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeProbe />
      </ThemeProvider>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('dark:dark');
    expect(document.documentElement).toHaveClass('dark');
    fireEvent.click(screen.getByRole('button', { name: 'Light' }));
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(document.documentElement).toHaveClass('light');
    expect(document.documentElement.style.colorScheme).toBe('light');
  });

  it('follows the system preference while retaining the system setting', () => {
    const media = mediaQuery(false);
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => media),
    );
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('system:light');
    media.matches = true;
    fireEvent(window, new StorageEvent('storage', { key: 'unrelated', newValue: 'dark' }));
    act(() => {
      media.dispatchEvent(new Event('change'));
    });
    expect(screen.getByRole('status')).toHaveTextContent('system:dark');
    expect(document.documentElement).toHaveClass('dark');
  });

  it('falls back safely when matchMedia is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined);
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('system:light');
  });

  it('rejects an invalid saved theme', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'invalid-theme');
    render(
      <ThemeProvider defaultTheme="dark">
        <ThemeProbe />
      </ThemeProvider>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('dark:dark');
    expect(document.documentElement).not.toHaveClass('invalid-theme');
  });

  it('still changes theme when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError');
    });
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeProbe />
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Dark' }));
    expect(screen.getByRole('status')).toHaveTextContent('dark:dark');
    expect(document.documentElement).toHaveClass('dark');
  });

  it('does not mutate the document or inject its script when opted out', () => {
    document.documentElement.className = 'light';
    const { container } = render(
      <ThemeProvider applyDocumentTheme={false}>
        <ThemeProbe />
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Dark' }));
    expect(screen.getByRole('status')).toHaveTextContent('dark:dark');
    expect(document.documentElement).toHaveClass('light');
    expect(container.querySelector('[data-slot="theme-script"]')).toBeNull();
  });

  it('synchronizes changes from another tab', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeProbe />
      </ThemeProvider>,
    );
    fireEvent(window, new StorageEvent('storage', { key: THEME_STORAGE_KEY, newValue: 'dark' }));
    expect(screen.getByRole('status')).toHaveTextContent('dark:dark');
  });

  it('does not create React-managed script nodes or emit a script warning', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeProbe />
      </ThemeProvider>,
    );
    expect(error).not.toHaveBeenCalled();
    expect(renderToStaticMarkup(<ThemeScript>{getThemeScript()}</ThemeScript>)).toContain('<script>');
  });

  it('produces an escaped, storage-failure-safe pre-hydration script', () => {
    const script = getThemeScript('cms."</script>', 'dark');
    expect(script).not.toContain('</script>');
    // Exercise the generated script as it would run before server markup paints.
    new Function('window', 'document', 'localStorage', script)(window, document, {
      getItem: () => {
        throw new Error('blocked');
      },
    });
    expect(document.documentElement).toHaveClass('dark');
  });
});
