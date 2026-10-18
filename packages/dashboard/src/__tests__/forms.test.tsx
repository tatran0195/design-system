import { Input } from '@cms/ui';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { FileUpload, isFileFormatAccepted } from '../components/common/file-upload';
import { Form } from '../components/common/form';
import { FilterGroup } from '../components/filtering/filter-group';
import { createMetadataRows, MetadataForm, parseMetadataRows } from '../components/forms/metadata-form';
import { KeyboundForm } from '../components/utilities/keybound-form';

function FieldDemo({ hint = true }: { hint?: boolean }) {
  const form = useForm<{ title: string }>({ defaultValues: { title: '' } });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => {})}>
        <Form.Field
          name="title"
          control={form.control}
          rules={{ required: 'Title is required' }}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Title</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              {hint && <Form.Hint>A short descriptive title</Form.Hint>}
              <Form.ErrorMessage />
            </Form.Item>
          )}
        />
        <button type="submit">Save</button>
      </form>
    </Form>
  );
}
describe('forms, files, and filtering', () => {
  it('links rendered field descriptions and validation errors without dangling ids', async () => {
    const { rerender } = render(<FieldDemo />);
    const input = screen.getByRole('textbox', { name: 'Title' });
    await waitFor(() => expect(input).toHaveAccessibleDescription('A short descriptive title'));
    fireEvent.click(screen.getByText('Save'));
    expect(await screen.findByRole('alert')).toHaveTextContent('Title is required');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    await waitFor(() => expect(input).toHaveAccessibleDescription('A short descriptive title Title is required'));
    rerender(<FieldDemo hint={false} />);
    await waitFor(() => expect(input).toHaveAccessibleDescription('Title is required'));
  });
  it('preserves custom input, label, and description ids', async () => {
    function Probe() {
      const form = useForm({ defaultValues: { field: '' } });
      return (
        <Form {...form}>
          <p id="outside">External help</p>
          <Form.Field
            name="field"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label id="custom-label">Custom field</Form.Label>
                <Form.Control>
                  <Input {...field} id="custom-input" aria-describedby="outside" />
                </Form.Control>
                <Form.Hint id="custom-hint">Local help</Form.Hint>
              </Form.Item>
            )}
          />
        </Form>
      );
    }
    render(<Probe />);
    const input = screen.getByRole('textbox', { name: 'Custom field' });
    expect(input).toHaveAttribute('id', 'custom-input');
    await waitFor(() => expect(screen.getByText('Custom field')).toHaveAttribute('for', 'custom-input'));
    expect(input).toHaveAccessibleDescription('Local help External help');
  });
  it('does not set description or label ids when no corresponding elements exist', () => {
    function Probe() {
      const form = useForm({ defaultValues: { field: '' } });
      return (
        <Form {...form}>
          <Form.Field
            name="field"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Control>
                  <Input {...field} aria-label="Standalone" />
                </Form.Control>
              </Form.Item>
            )}
          />
        </Form>
      );
    }
    render(<Probe />);
    const input = screen.getByRole('textbox', { name: 'Standalone' });
    expect(input).not.toHaveAttribute('aria-describedby');
    expect(input).not.toHaveAttribute('aria-labelledby');
  });
  it('preserves complex metadata and does not encode backend deletion semantics', () => {
    const original = { nested: { source: true }, count: 3, deleted: 'remove' };
    const rows = createMetadataRows(original).filter((row) => row.key !== 'deleted');
    const result = parseMetadataRows(rows);
    expect(result).toEqual({ nested: { source: true }, count: 3 });
    expect(result).not.toHaveProperty('deleted');
  });
  it('supports explicit string values and rejects duplicate trimmed keys', () => {
    expect(parseMetadataRows([{ key: 'code', value: '001' }], 'string')).toEqual({ code: '001' });
    expect(() =>
      parseMetadataRows([
        { key: 'key', value: 'a' },
        { key: ' key ', value: 'b' },
      ]),
    ).toThrow('Duplicate');
  });
  it('creates metadata with prototype-like keys as ordinary own properties', () => {
    const payload = parseMetadataRows([{ key: '__proto__', value: 'safe' }]);
    expect(Object.getPrototypeOf(payload)).toBe(Object.prototype);
    expect(Object.hasOwn(payload, '__proto__')).toBe(true);
  });
  it('submits metadata with callback errors shown inline', async () => {
    const submit = vi.fn(async () => {
      throw new Error('Save failed');
    });
    render(<MetadataForm metadata={{ enabled: true }} onSubmit={submit} />);
    fireEvent.click(screen.getByRole('button', { name: 'Save metadata' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Save failed');
    expect(submit).toHaveBeenCalledWith({ enabled: true });
  });
  it('validates MIME types, wildcards, and case-insensitive extensions', () => {
    expect(isFileFormatAccepted({ name: 'photo.PNG', type: 'image/png' }, ['.png'])).toBe(true);
    expect(isFileFormatAccepted({ name: 'photo.png', type: 'image/png' }, ['image/*'])).toBe(true);
    expect(isFileFormatAccepted({ name: 'script.js', type: 'text/javascript' }, ['image/*', '.png'])).toBe(false);
  });
  it('rejects formats and oversized uploads and clears the input', () => {
    const uploaded = vi.fn();
    const { container } = render(<FileUpload label="Upload" formats={['.png']} maxFileSize={4} onUploaded={uploaded} createPreview={false} />);
    const input = container.querySelector('input[type=file]')!;
    fireEvent.change(input, {
      target: {
        files: [
          new File(['ok'], 'ok.png', { type: 'image/png' }),
          new File(['too long'], 'large.png', { type: 'image/png' }),
          new File(['x'], 'bad.js', { type: 'text/javascript' }),
        ],
      },
    });
    expect(uploaded.mock.calls[0]?.[0]).toHaveLength(1);
    expect(uploaded.mock.calls[0]?.[1].map((file: { reason: string }) => file.reason)).toEqual(['size', 'format']);
    expect(input).toHaveValue('');
  });
  it('revokes generated object URLs on unmount', () => {
    const create = vi.fn(() => 'blob:test');
    const revoke = vi.fn();
    vi.stubGlobal(
      'URL',
      class extends URL {
        static createObjectURL = create;
        static revokeObjectURL = revoke;
      },
    );
    const { container, unmount } = render(<FileUpload label="Upload" onUploaded={() => {}} />);
    fireEvent.change(container.querySelector('input')!, { target: { files: [new File(['x'], 'a.png')] } });
    unmount();
    expect(revoke).toHaveBeenCalledWith('blob:test');
  });
  it('requests a real submit on Cmd/Ctrl+Enter and preserves caller key handlers', async () => {
    const submit = vi.fn();
    const keys = vi.fn();
    render(
      <KeyboundForm onSubmit={submit} onKeyDown={keys}>
        <input aria-label="Name" />
        <button type="submit">Submit</button>
      </KeyboundForm>,
    );
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    expect(submit).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter', ctrlKey: true });
    expect(submit).toHaveBeenCalledTimes(1);
    expect(keys).toHaveBeenCalledTimes(2);
  });
  it('removes active filters and clears their host state', () => {
    const remove = vi.fn();
    const clear = vi.fn();
    const change = vi.fn();
    render(
      <FilterGroup
        filters={[{ id: 'status', label: 'Status', content: 'Published' }]}
        activeIds={['status']}
        onRemove={remove}
        onClear={clear}
        onActiveIdsChange={change}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Remove Status filter' }));
    expect(remove).toHaveBeenCalledWith('status');
    expect(change).toHaveBeenCalledWith([]);
    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(clear).toHaveBeenCalledTimes(1);
  });
});
