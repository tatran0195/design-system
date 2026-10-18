'use client';

import { ArrowDownMini, ArrowUpMini, Trash } from '@cms/icons';
import { Button, IconButton, Input, Text } from '@cms/ui';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Form } from '../../common/form';
import { KeyboundForm } from '../../utilities/keybound-form';
export interface MetadataRow {
  key: string;
  value: string;
  locked?: boolean;
  originalValue?: unknown;
}
export function createMetadataRows(metadata?: Record<string, unknown> | null): MetadataRow[] {
  const rows = Object.entries(metadata ?? {}).map(([key, value]) => ({
    key,
    value: typeof value === 'string' ? value : ['number', 'boolean'].includes(typeof value) ? String(value) : '',
    locked: !['string', 'number', 'boolean'].includes(typeof value),
    originalValue: value,
  }));
  return rows.length ? rows : [{ key: '', value: '' }];
}
export function parseMetadataRows(rows: MetadataRow[], mode: 'string' | 'infer' = 'infer'): Record<string, unknown> | null {
  const entries: [string, unknown][] = [];
  const keys = new Set<string>();
  for (const row of rows) {
    const key = row.key.trim();
    if (!key) continue;
    if (keys.has(key)) throw new Error(`Duplicate metadata key: ${key}`);
    keys.add(key);
    const text = row.value.trim();
    let value: unknown = text;
    if (row.locked) value = row.originalValue;
    else if (mode === 'infer') {
      if (text === 'true' || text === 'false') value = text === 'true';
      else if (/^-?\d*\.?\d+$/.test(text) && Number.isFinite(Number(text))) value = Number(text);
    }
    entries.push([key, value]);
  }
  return entries.length ? Object.fromEntries(entries) : null;
}
export interface MetadataFormProps {
  metadata?: Record<string, unknown> | null;
  /** Receives a complete snapshot. Deletion semantics are intentionally host-owned. */
  onSubmit: (metadata: Record<string, unknown> | null) => void | Promise<void>;
  onCancel?: () => void;
  valueMode?: 'string' | 'infer';
  disabled?: boolean;
  className?: string;
}
export function MetadataForm({ metadata, onSubmit, onCancel, valueMode = 'infer', disabled, className }: MetadataFormProps) {
  const form = useForm<{ rows: MetadataRow[] }>({ defaultValues: { rows: createMetadataRows(metadata) } });
  const { fields, append, remove, move } = useFieldArray({ control: form.control, name: 'rows' });
  const [error, setError] = useState<string | null>(null);
  const submitting = form.formState.isSubmitting;
  const blocked = submitting || disabled;
  return (
    <Form {...form}>
      <KeyboundForm
        className={className}
        onSubmit={form.handleSubmit(async (values) => {
          setError(null);
          try {
            const next = parseMetadataRows(values.rows, valueMode);
            await onSubmit(next);
            form.reset({ rows: createMetadataRows(next) });
          } catch (error) {
            setError(error instanceof Error ? error.message : 'Unable to save metadata.');
          }
        })}
      >
        <fieldset disabled={blocked} className="flex min-w-0 flex-col gap-3">
          <legend className="sr-only">Metadata</legend>
          <div className="border-ui-border-base overflow-hidden rounded-lg border">
            <div className="bg-ui-bg-subtle text-ui-fg-subtle grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 px-3 py-2 text-sm font-medium">
              <span>Key</span>
              <span>Value</span>
              <span className="w-20" aria-hidden />
            </div>
            {fields.map((row, index) => (
              <div key={row.id} className="border-ui-border-base grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-start gap-2 border-t p-2">
                <Form.Field
                  control={form.control}
                  name={`rows.${index}.key`}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Control>
                        <Input {...field} aria-label={`Key ${index + 1}`} placeholder="Key" disabled={row.locked || blocked} />
                      </Form.Control>
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name={`rows.${index}.value`}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Control>
                        <Input
                          {...field}
                          aria-label={`Value ${index + 1}`}
                          placeholder={row.locked ? 'Complex value (preserved)' : 'Value'}
                          disabled={row.locked || blocked}
                        />
                      </Form.Control>
                    </Form.Item>
                  )}
                />
                <div className="flex h-8 items-center gap-0.5">
                  <IconButton
                    type="button"
                    size="2xsmall"
                    variant="transparent"
                    aria-label={`Move row ${index + 1} up`}
                    disabled={index === 0 || blocked}
                    onClick={() => move(index, index - 1)}
                  >
                    <ArrowUpMini />
                  </IconButton>
                  <IconButton
                    type="button"
                    size="2xsmall"
                    variant="transparent"
                    aria-label={`Move row ${index + 1} down`}
                    disabled={index === fields.length - 1 || blocked}
                    onClick={() => move(index, index + 1)}
                  >
                    <ArrowDownMini />
                  </IconButton>
                  <IconButton
                    type="button"
                    size="2xsmall"
                    variant="transparent"
                    aria-label={`Delete row ${index + 1}`}
                    disabled={row.locked || blocked}
                    onClick={() => remove(index)}
                  >
                    <Trash />
                  </IconButton>
                </div>
              </div>
            ))}
          </div>
          {fields.some((row) => row.locked) && (
            <Text size="small" className="text-ui-fg-subtle">
              Objects, arrays and null values are preserved without modification.
            </Text>
          )}
          {error && (
            <Text role="alert" size="small" className="text-ui-fg-error">
              {error}
            </Text>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button type="button" variant="secondary" size="small" onClick={() => append({ key: '', value: '' })}>
              Add row
            </Button>
            <div className="flex gap-2">
              {onCancel && (
                <Button type="button" variant="secondary" size="small" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" size="small" isLoading={submitting}>
                Save metadata
              </Button>
            </div>
          </div>
        </fieldset>
      </KeyboundForm>
    </Form>
  );
}
