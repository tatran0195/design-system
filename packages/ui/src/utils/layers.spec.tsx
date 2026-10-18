import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { createPortal } from 'react-dom';
import { Drawer } from '@/components/drawer';
import { usePrompt } from '@/hooks/use-prompt';
import { UiLayer, uiLayerBackdrop, uiLayerStyle, useUiLayer } from './layers';

function Probe({ id, kind = 'popover' }: { id: string; kind?: 'popover' | 'tooltip' | 'modal' | 'prompt' | 'toast' }) {
  return <output data-testid={id}>{useUiLayer(kind)}</output>;
}

describe('shared UI layers', () => {
  it('uses semantic root tokens without adding a DOM wrapper', () => {
    const { container } = render(<UiLayer kind="modal">{(layer) => <output>{layer}</output>}</UiLayer>);
    expect(container.children).toHaveLength(1);
    expect(container.firstElementChild?.tagName).toBe('OUTPUT');
    expect(container.textContent).toBe('var(--z-index-ui-modal)');
  });

  it('carries the owning layer through a real portal, without raising unrelated background flyouts', () => {
    render(
      <>
        <Probe id="background" />
        <UiLayer kind="modal">
          {() =>
            createPortal(
              <>
                <Probe id="popup" />
                <Probe id="tip" kind="tooltip" />
                <Probe id="toast" kind="toast" />
              </>,
              document.body,
            )
          }
        </UiLayer>
      </>,
    );
    expect(screen.getByTestId('background').textContent).toBe('var(--z-index-ui-popover)');
    expect(screen.getByTestId('popup').textContent).toBe(
      'max(var(--z-index-ui-popover), calc(var(--z-index-ui-modal) + var(--ui-layer-popover-offset)))',
    );
    expect(screen.getByTestId('tip').textContent).toBe(
      'max(var(--z-index-ui-tooltip), calc(var(--z-index-ui-modal) + var(--ui-layer-tooltip-offset)))',
    );
    expect(screen.getByTestId('toast').textContent).toBe('var(--z-index-ui-toast)');
  });

  it('advances nested surfaces and follows an explicit style override', () => {
    render(
      <UiLayer kind="modal" zIndex={130}>
        {() => (
          <UiLayer kind="modal">
            {(layer) => (
              <>
                <output data-testid="nested">{layer}</output>
                <Probe id="confirmation" kind="prompt" />
              </>
            )}
          </UiLayer>
        )}
      </UiLayer>,
    );
    expect(screen.getByTestId('nested').textContent).toBe('max(var(--z-index-ui-modal), calc(130 + var(--ui-layer-stack-step)))');
    expect(screen.getByTestId('confirmation').textContent).toBe(
      'max(var(--z-index-ui-prompt), calc(max(var(--z-index-ui-modal), calc(130 + var(--ui-layer-stack-step))) + var(--ui-layer-stack-step)))',
    );
  });

  it('preserves modal refs/styles and pairs its backdrop with the overridden content layer', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Drawer open>
        <Drawer.Content ref={ref} style={{ zIndex: 150, width: 480 }}>
          <Drawer.Title>Layered drawer</Drawer.Title>
          <Drawer.Description>A fixture.</Drawer.Description>
          <Probe id="owned" />
        </Drawer.Content>
      </Drawer>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Layered drawer' });
    expect(ref.current).toBe(dialog);
    expect(dialog.style.zIndex).toBe('150');
    expect(dialog.style.width).toBe('480px');
    expect(document.querySelector<HTMLElement>('[data-ui-layer="modal-backdrop"]')).toHaveStyle({ zIndex: 'calc(150 - 1)' });
    expect(screen.getByTestId('owned').textContent).toBe('max(var(--z-index-ui-popover), calc(150 + var(--ui-layer-popover-offset)))');
  });

  it('does not let an undefined style override erase the default modal layer', () => {
    render(
      <Drawer open>
        <Drawer.Content style={{ zIndex: undefined }}>
          <Drawer.Title>Default layer</Drawer.Title>
          <Drawer.Description>A fixture.</Drawer.Description>
        </Drawer.Content>
      </Drawer>,
    );
    expect(screen.getByRole('dialog', { name: 'Default layer' }).style.zIndex).toBe('var(--z-index-ui-modal)');
  });

  it('bridges a deeply nested imperative prompt into its separate React root', async () => {
    function Action() {
      const prompt = usePrompt();
      return <button onClick={() => void prompt({ title: 'Confirm nested change', description: 'Layer bridge fixture.' })}>Ask</button>;
    }
    render(
      <UiLayer kind="modal" zIndex={130}>
        {() => <Action />}
      </UiLayer>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Ask' }));
    const dialog = await screen.findByRole('alertdialog');
    const value = 'max(var(--z-index-ui-prompt), calc(130 + var(--ui-layer-stack-step)))';
    expect(dialog.style.zIndex).toBe(value);
    expect(document.querySelector<HTMLElement>('[data-ui-layer="prompt-backdrop"]')?.style.zIndex).toBe(`calc(${value} - 1)`);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('preserves explicit CSS-wide z-index opt-outs without creating an invalid backdrop calculation', () => {
    expect(uiLayerBackdrop(150)).toBe('calc(150 - 1)');
    expect(uiLayerBackdrop('auto')).toBe('auto');
    render(
      <Drawer open>
        <Drawer.Content style={{ zIndex: 'auto' }}>
          <Drawer.Title>Auto layer</Drawer.Title>
          <Drawer.Description>An explicit opt-out.</Drawer.Description>
        </Drawer.Content>
      </Drawer>,
    );
    expect(screen.getByRole('dialog', { name: 'Auto layer' }).style.zIndex).toBe('auto');
    expect(document.querySelector<HTMLElement>('[data-ui-layer="modal-backdrop"]')?.style.zIndex).toBe('auto');
  });

  it('preserves stateful Base UI styles, calls them once, and tolerates undefined returns', () => {
    const callback = vi.fn((state: { open: boolean }) => (state.open ? { opacity: 1, zIndex: 91 } : undefined));
    const style = uiLayerStyle(40, callback);
    expect(typeof style).toBe('function');
    if (typeof style !== 'function') throw new Error('Expected state-dependent style.');
    expect(style({ open: true })).toEqual({ opacity: 1, zIndex: 91 });
    expect(callback).toHaveBeenCalledTimes(1);
    expect(style({ open: false })).toEqual({ zIndex: 40 });
    expect(uiLayerStyle(40, { width: 320 })).toEqual({ width: 320, zIndex: 40 });
    expect(uiLayerStyle(40, { zIndex: undefined })).toEqual({ zIndex: 40 });
  });
});
