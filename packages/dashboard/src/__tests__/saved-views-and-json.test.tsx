import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { JsonViewSection } from '../components/common/json-view-section';
import { SaveViewDropdown } from '../components/table/save-view-dropdown';
import { DashboardProvider } from '../config';

async function openMenu() {
  await userEvent.setup().click(screen.getByRole('button', { name: 'Save view' }));
  await screen.findByRole('menuitem', { name: 'Update default view' });
}
describe('saved-view menu and JSON clipboard', () => {
  it('keeps asynchronous confirmation in the scoped provider tree and contains failures', async () => {
    const failed = new Error('offline');
    const update = vi.fn(async () => {
      throw failed;
    });
    const error = vi.fn();
    render(
      <DashboardProvider direction="rtl">
        <SaveViewDropdown isDefaultView onSaveAsDefault={update} onError={error} />
      </DashboardProvider>,
    );
    await openMenu();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Update default view' }));
    const prompt = await screen.findByRole('alertdialog');
    expect(prompt).toHaveAttribute('dir', 'rtl');
    fireEvent.click(screen.getByRole('button', { name: 'Update view' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to save');
    expect(error).toHaveBeenCalledWith(failed);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });
  it('contains rejected save-as-new callbacks without confirmation or unhandled rejection', async () => {
    render(
      <SaveViewDropdown
        isDefaultView
        onSaveAsNew={async () => {
          throw new Error('offline');
        }}
      />,
    );
    await userEvent.setup().click(screen.getByRole('button', { name: 'Save view' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Save as new view' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to save');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
  it('safely handles denied and unavailable JSON clipboard access without losing the copy control', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('permission denied'));
    const descriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    try {
      const { unmount } = render(<JsonViewSection data={{ value: 'Portable' }} title="Record JSON" />);
      fireEvent.click(screen.getByRole('button', { name: 'Open Record JSON' }));
      const button = (await screen.findAllByRole('button', { name: 'Copy JSON value' }))[0]!;
      await act(async () => fireEvent.click(button));
      expect(writeText).toHaveBeenCalled();
      expect(button).toHaveAttribute('aria-label', 'Copy JSON value');
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
      await act(async () => fireEvent.click(button));
      expect(button).toBeInTheDocument();
      unmount();
    } finally {
      if (descriptor) Object.defineProperty(navigator, 'clipboard', descriptor);
      else delete (navigator as { clipboard?: unknown }).clipboard;
    }
  });
});
