// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Command, CommandInput, CommandItem, CommandList } from '@/shared/ui/command';
import { Dialog, DialogContent, DialogTitle } from '@/shared/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';

describe('app Base UI compatibility adapters', () => {
  it('keeps numeric zero values and labels without coercing selection to strings', async () => {
    const selected = vi.fn();
    function Example() {
      const [value, setValue] = useState(0);
      return (
        <Select<number>
          value={value}
          onValueChange={(next) => {
            setValue(next);
            selected(next);
          }}
        >
          <SelectTrigger aria-label="Retention">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={0}>Keep forever</SelectItem>
            <SelectItem value={30}>Thirty days</SelectItem>
          </SelectContent>
        </Select>
      );
    }
    render(<Example />);
    expect(screen.getByRole('combobox', { name: 'Retention' })).toHaveTextContent('Keep forever');
    await userEvent.click(screen.getByRole('combobox', { name: 'Retention' }));
    await userEvent.click(screen.getByRole('option', { name: 'Thirty days' }));
    expect(selected).toHaveBeenCalledWith(30);
  });
  it('preserves enum values and does not activate disabled options', async () => {
    const selected = vi.fn();
    function Example() {
      const [value, setValue] = useState<'PUBLIC' | 'READERS'>('PUBLIC');
      return (
        <Select
          value={value}
          onValueChange={(next) => {
            setValue(next);
            selected(next);
          }}
        >
          <SelectTrigger aria-label="Access">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PUBLIC">Public</SelectItem>
            <SelectItem value="READERS" disabled>
              Readers only
            </SelectItem>
          </SelectContent>
        </Select>
      );
    }
    render(<Example />);
    await userEvent.click(screen.getByRole('combobox', { name: 'Access' }));
    await userEvent.click(screen.getByRole('option', { name: 'Readers only' }));
    expect(selected).not.toHaveBeenCalled();
  });
  it('keeps multiple numeric values in the native selection model', async () => {
    const selected = vi.fn();
    function Example() {
      const [value, setValue] = useState([1]);
      return (
        <Select<number, true>
          multiple
          value={value}
          onValueChange={(next) => {
            setValue(next);
            selected(next);
          }}
        >
          <SelectTrigger aria-label="Audiences">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={1}>One</SelectItem>
            <SelectItem value={2}>Two</SelectItem>
          </SelectContent>
        </Select>
      );
    }
    render(<Example />);
    await userEvent.click(screen.getByRole('combobox', { name: 'Audiences' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Two' }));
    expect(selected).toHaveBeenCalledWith([1, 2]);
  });
  it('uses native keyboard activation with fuzzy label/keyword matching', async () => {
    const selected = vi.fn();
    render(
      <Command>
        <CommandInput aria-label="Search actions" />
        <CommandList>
          <CommandItem value="opaque-id" keywords={['workspace', 'overview']} onSelect={selected}>
            Workspace overview
          </CommandItem>
          <CommandItem value="disabled" disabled onSelect={selected}>
            Unavailable
          </CommandItem>
        </CommandList>
      </Command>,
    );
    const input = screen.getByRole('combobox', { name: 'Search actions' });
    await userEvent.type(input, 'wov');
    await waitFor(() => expect(screen.getByRole('option', { name: 'Workspace overview' })).toBeVisible());
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(selected).toHaveBeenCalledWith('opaque-id');
  });
  it('never activates a disabled command with a pointer', async () => {
    const selected = vi.fn();
    render(
      <Command>
        <CommandInput aria-label="Actions" />
        <CommandList>
          <CommandItem value="disabled" disabled onSelect={selected}>
            Unavailable
          </CommandItem>
        </CommandList>
      </Command>,
    );
    await userEvent.click(screen.getByRole('option', { name: 'Unavailable' }));
    expect(selected).not.toHaveBeenCalled();
  });
  it('lets the native modal own autofocus, Escape and returning focus', async () => {
    function Example() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>Open settings</button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogTitle>Settings</DialogTitle>
              <input aria-label="Setting name" />
            </DialogContent>
          </Dialog>
        </>
      );
    }
    render(<Example />);
    const opener = screen.getByRole('button', { name: 'Open settings' });
    await userEvent.click(opener);
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Setting name' })).toHaveFocus());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(opener).toHaveFocus());
  });
});
