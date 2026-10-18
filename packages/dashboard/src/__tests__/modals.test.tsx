import { Input } from '@cms/ui';
import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { RouteModalForm } from '../components/modals/route-modal-form';
import { RouteModalProvider, useRouteModal } from '../components/modals/route-modal-provider';
import { StackedModalProvider, useStackedModal } from '../components/modals/stacked-modal-provider';

describe('controlled modal adapters', () => {
  it('does not navigate implicitly and honors registered close guards', async () => {
    const close = vi.fn();
    const { result } = renderHook(() => useRouteModal(), {
      wrapper: ({ children }) => <RouteModalProvider onClose={close}>{children}</RouteModalProvider>,
    });
    let unregister!: () => void;
    act(() => {
      unregister = result.current.registerCloseGuard(() => false);
    });
    await act(async () => {
      expect(await result.current.requestClose()).toBe(false);
    });
    expect(close).not.toHaveBeenCalled();
    act(() => unregister());
    await act(async () => {
      expect(await result.current.requestClose()).toBe(true);
    });
    expect(close).toHaveBeenCalledTimes(1);
  });
  it('treats rejected guards as a reported denial instead of an unhandled rejection', async () => {
    const error = new Error('Guard failed');
    const close = vi.fn();
    const report = vi.fn();
    const { result } = renderHook(() => useRouteModal(), {
      wrapper: ({ children }) => (
        <RouteModalProvider onClose={close} onCloseError={report}>
          {children}
        </RouteModalProvider>
      ),
    });
    act(() =>
      result.current.registerCloseGuard(async () => {
        throw error;
      }),
    );
    await act(async () => expect(await result.current.requestClose()).toBe(false));
    expect(close).not.toHaveBeenCalled();
    expect(report).toHaveBeenCalledWith(error);
  });
  it('tracks any open stacked modal rather than the most recently changed one', async () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() => useStackedModal(), {
      wrapper: ({ children }) => <StackedModalProvider onOpenChange={onOpenChange}>{children}</StackedModalProvider>,
    });
    act(() => {
      result.current.register('a');
      result.current.register('b');
      result.current.setIsOpen('a', true);
      result.current.setIsOpen('b', true);
    });
    act(() => result.current.setIsOpen('a', false));
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    act(() => result.current.unregister('b'));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });
  it('confirms dirty form dismissal and lets the user cancel before discarding', async () => {
    const close = vi.fn();
    function Probe() {
      const form = useForm({ defaultValues: { title: '' } });
      const { requestClose } = useRouteModal();
      return (
        <RouteModalForm form={form}>
          <Input aria-label="Title" {...form.register('title')} />
          <button type="button" onClick={() => void requestClose()}>
            Close form
          </button>
        </RouteModalForm>
      );
    }
    render(
      <RouteModalProvider onClose={close}>
        <Probe />
      </RouteModalProvider>,
    );
    fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: 'edited' } });
    fireEvent.click(screen.getByRole('button', { name: 'Close form' }));
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(close).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Close form' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(close).toHaveBeenCalledTimes(1));
  });
});
