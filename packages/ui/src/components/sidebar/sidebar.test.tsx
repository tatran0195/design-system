import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider, SidebarTrigger } from './sidebar';

function SidebarProbe({ preventToggle = false }: { preventToggle?: boolean }) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>Navigation</SidebarHeader>
        <SidebarContent>Contents</SidebarContent>
      </Sidebar>
      <SidebarTrigger
        onClick={(event) => {
          if (preventToggle) event.preventDefault();
        }}
      />
      <input aria-label="Text field" />
      <div contentEditable suppressContentEditableWarning aria-label="Editor">
        Document
      </div>
    </SidebarProvider>
  );
}

beforeEach(() => {
  vi.stubGlobal('innerWidth', 1200);
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Sidebar interactions', () => {
  it('toggles with its button and exposes the expanded state', () => {
    const { container } = render(<SidebarProbe />);
    const trigger = screen.getByRole('button', { name: 'Toggle Sidebar' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(container.querySelector('[data-slot="sidebar"]')).toHaveAttribute('data-state', 'collapsed');
    expect(document.cookie).toContain('sidebar_state=false');
  });

  it('supports the shortcut outside text editing', () => {
    render(<SidebarProbe />);
    fireEvent.keyDown(document.body, { key: 'b', ctrlKey: true });
    expect(screen.getByRole('button', { name: 'Toggle Sidebar' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('does not steal Ctrl+B from inputs or contenteditable editors', () => {
    render(<SidebarProbe />);
    fireEvent.keyDown(screen.getByLabelText('Text field'), { key: 'b', ctrlKey: true });
    fireEvent.keyDown(screen.getByLabelText('Editor'), { key: 'b', ctrlKey: true });
    expect(screen.getByRole('button', { name: 'Toggle Sidebar' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('respects a canceled trigger click', () => {
    render(<SidebarProbe preventToggle />);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle Sidebar' }));
    expect(screen.getByRole('button', { name: 'Toggle Sidebar' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('exposes an accessible close button in the mobile sheet', async () => {
    vi.stubGlobal('innerWidth', 390);
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
    );
    render(<SidebarProbe />);
    const trigger = screen.getByRole('button', { name: 'Toggle Sidebar' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Navigation')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});

it('keeps toggling when cookies cannot be written', () => {
  vi.spyOn(Document.prototype, 'cookie', 'set').mockImplementation(() => {
    throw new DOMException('Blocked', 'SecurityError');
  });
  render(<SidebarProbe />);
  fireEvent.click(screen.getByRole('button', { name: 'Toggle Sidebar' }));
  expect(screen.getByRole('button', { name: 'Toggle Sidebar' })).toHaveAttribute('aria-expanded', 'false');
});
