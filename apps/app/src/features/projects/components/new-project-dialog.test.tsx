// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { NewProjectDialog } from './new-project-dialog';

const mocks = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock('@/entities/project/api', () => ({ useCreateProject: () => ({ mutate: mocks.create }) }));
vi.mock('@/shared/i18n/react', () => ({ useT: () => (key: string) => key }));
vi.mock('@/shared/ui/sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it('uses the migrated focus-modal frame, toolbar, scrollable body and footer', () => {
  render(<NewProjectDialog open onOpenChange={vi.fn()} />);
  const dialog = screen.getByRole('dialog', { name: 'newSite.title' });
  expect(dialog.classList.contains('inset-2')).toBe(true);
  expect(dialog.classList.contains('max-w-lg')).toBe(false);
  expect(dialog.querySelector('form')?.classList.contains('overflow-hidden')).toBe(true);
  expect(screen.getByText('esc')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'common.cancel' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'newSite.create' }).hasAttribute('disabled')).toBe(true);
});

it('preserves the trimmed create payload and closes after success', async () => {
  const change = vi.fn();
  render(<NewProjectDialog open onOpenChange={change} />);
  fireEvent.change(screen.getByRole('textbox', { name: 'newSite.name' }), { target: { value: '  Handbook  ' } });
  fireEvent.click(screen.getByRole('button', { name: 'newSite.create' }));
  await waitFor(() => expect(mocks.create).toHaveBeenCalledWith({ name: 'Handbook' }, expect.any(Object)));
  const callbacks = mocks.create.mock.calls[0]?.[1];
  callbacks.onSuccess();
  expect(change).toHaveBeenCalledWith(false);
});

it('cancels without submitting a project', async () => {
  function Example() {
    const [open, setOpen] = useState(true);
    return <NewProjectDialog open={open} onOpenChange={setOpen} />;
  }
  render(<Example />);
  fireEvent.click(screen.getByRole('button', { name: 'common.cancel' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(mocks.create).not.toHaveBeenCalled();
});
