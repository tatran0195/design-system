// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

const feedback = vi.hoisted(() => ({ error: vi.fn() }));
vi.mock('@/shared/ui/sonner', () => ({ toast: feedback }));

import { usePayloadForm } from '@/shared/forms/use-payload-form';

const schema = z.object({ title: z.string().min(1, 'Title is required'), count: z.number(), rows: z.array(z.object({ name: z.string() })) });
const initial = { title: 'Initial', count: 0, rows: [{ name: 'First' }] };

describe('copied payload forms use one RHF/Zod owner', () => {
  it('applies repeated functional updates against the latest stored value', async () => {
    const { result } = renderHook(() => usePayloadForm(schema, initial));
    expect(result.current.formState.isDirty).toBe(false);
    await act(async () => {
      const [, setCount] = result.current.field('count');
      setCount((value) => value + 1);
      setCount((value) => value + 1);
    });
    expect(result.current.getValues('count')).toBe(2);
    expect(result.current.formState.isDirty).toBe(true);
  });
  it('owns nested dot paths and array updates without local field state', async () => {
    const { result } = renderHook(() => usePayloadForm(schema, initial));
    await act(async () => result.current.field('rows.0.name')[1]('Edited'));
    await act(async () => result.current.field('rows')[1]((rows) => [...rows, { name: 'Second' }]));
    expect(result.current.getValues('rows')).toEqual([{ name: 'Edited' }, { name: 'Second' }]);
  });
  it('blocks invalid payloads and reads the latest value at submission (OTP completion pattern)', async () => {
    const { result } = renderHook(() => usePayloadForm(schema, initial));
    const save = vi.fn();
    await act(async () => result.current.field('title')[1](''));
    await act(async () => result.current.submit(save)());
    expect(save).not.toHaveBeenCalled();
    expect(feedback.error).toHaveBeenCalledWith('Title is required');
    await act(async () => {
      result.current.field('title')[1]('Complete');
      await result.current.submit(save)();
    });
    expect(save.mock.calls[0]?.[0].title).toBe('Complete');
  });
  it('resets on a new supplied record without per-field synchronization effects', async () => {
    const { result, rerender } = renderHook(({ data }) => usePayloadForm(schema, data), { initialProps: { data: initial } });
    await act(async () => result.current.field('title')[1]('Unsaved'));
    rerender({ data: { title: 'Different record', count: 3, rows: [] } });
    await waitFor(() => expect(result.current.getValues()).toEqual({ title: 'Different record', count: 3, rows: [] }));
    expect(result.current.formState.isDirty).toBe(false);
  });
  it('keeps submission pending until the asynchronous callback finishes', async () => {
    const { result } = renderHook(() => usePayloadForm(schema, initial));
    expect(result.current.formState.isSubmitting).toBe(false);
    let release = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    let submitted: Promise<void> = Promise.resolve();
    await act(async () => {
      submitted = result.current.submit(async () => {
        await gate;
      })();
    });
    await waitFor(() => expect(result.current.formState.isSubmitting).toBe(true));
    await act(async () => {
      release();
      await submitted;
    });
    expect(result.current.formState.isSubmitting).toBe(false);
  });
});
