// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { useFieldForm as useForm } from '@/shared/forms/use-field-form';

type Draft = { label: string; rows: Array<{ id: string; name: string }> };
function Example({ initial, save }: { initial: Draft; save: (value: Draft) => void }) {
  const form = useForm({ defaultValues: initial, onSubmit: ({ value }) => save(value) });
  return (
    <form
      aria-label="Editor payload"
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.Field name="label" validators={{ onChange: ({ value }) => (value.trim() ? undefined : 'A label is required') }}>
        {(field) => (
          <>
            <input
              aria-label="Label"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
            />
            <span role="alert">{field.state.meta.errors.join(', ')}</span>
          </>
        )}
      </form.Field>
      <form.Field name="rows" mode="array">
        {(field) => (
          <>
            <button type="button" onClick={() => field.pushValue({ id: 'next', name: 'Next' })}>
              Add row
            </button>
            <button type="button" onClick={() => field.removeValue(0)}>
              Remove first
            </button>
            {field.state.value.map((item, index) => (
              <form.Field key={item.id} name={`rows.${index}.name`}>
                {(row) => (
                  <input aria-label={`Row ${index + 1}`} value={row.state.value} onChange={(event) => row.handleChange(event.target.value)} />
                )}
              </form.Field>
            ))}
          </>
        )}
      </form.Field>
      <form.Subscribe selector={(state) => ({ pending: state.isSubmitting, valid: state.canSubmit, label: state.values.label })}>
        {(state) => (
          <>
            <output>{state.label}</output>
            <button type="submit" disabled={!state.valid || state.pending}>
              Save
            </button>
          </>
        )}
      </form.Subscribe>
      <button type="button" onClick={() => form.reset(initial)}>
        Reset
      </button>
    </form>
  );
}

describe('RHF bridge for retained field/render callers', () => {
  it('executes field checks through Zod and never submits an invalid payload', async () => {
    const save = vi.fn();
    render(<Example initial={{ label: '', rows: [] }} save={save} />);
    fireEvent.submit(screen.getByRole('form', { name: 'Editor payload' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('A label is required'));
    expect(save).not.toHaveBeenCalled();
    await userEvent.type(screen.getByRole('textbox', { name: 'Label' }), 'Handbook');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled());
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(save).toHaveBeenCalledWith({ label: 'Handbook', rows: [] });
  });
  it('keeps array push/remove, nested fields and subscription values in the same RHF store', async () => {
    const save = vi.fn();
    render(<Example initial={{ label: 'Docs', rows: [{ id: 'first', name: 'First' }] }} save={save} />);
    await userEvent.click(screen.getByRole('button', { name: 'Add row' }));
    await userEvent.clear(screen.getByRole('textbox', { name: 'Row 2' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Row 2' }), 'Second');
    await userEvent.click(screen.getByRole('button', { name: 'Remove first' }));
    expect(screen.getByRole('textbox', { name: 'Row 1' })).toHaveValue('Second');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(save).toHaveBeenCalledWith({ label: 'Docs', rows: [{ id: 'next', name: 'Second' }] });
  });
  it('resets cancelled edits and follows a replacement record without syncing fields in effects', async () => {
    const save = vi.fn();
    const { rerender } = render(<Example initial={{ label: 'One', rows: [] }} save={save} />);
    await userEvent.type(screen.getByRole('textbox', { name: 'Label' }), ' changed');
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByRole('textbox', { name: 'Label' })).toHaveValue('One');
    rerender(<Example initial={{ label: 'Two', rows: [] }} save={save} />);
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Label' })).toHaveValue('Two'));
  });
});
