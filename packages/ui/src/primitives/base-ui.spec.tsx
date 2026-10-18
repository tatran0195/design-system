import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button } from '@/components/button';
import { Checkbox } from '@/components/checkbox';
import { ContextMenu } from '@/components/context-menu';
import { DirectionProvider } from '@/components/direction';
import { Drawer } from '@/components/drawer';
import { DropdownMenu } from '@/components/dropdown-menu';
import { Popover } from '@/components/popover';
import { ProgressAccordion } from '@/components/progress-accordion';
import { Prompt } from '@/components/prompt';
import { RadioGroup } from '@/components/radio-group';
import { Select } from '@/components/select';
import { Switch } from '@/components/switch';
import { Tabs } from '@/components/tabs';
import { Tooltip } from '@/components/tooltip';
import { Slot } from './parts';

afterEach(cleanup);
const selectOptions = (
  <>
    <Select.Item value="draft">Draft label</Select.Item>
    <Select.Item value="published">Published label</Select.Item>
  </>
);

describe('Base UI-backed CMS composition and controls', () => {
  it('composes child content, refs, classes, styles and both click handlers without a wrapper', async () => {
    const outer = React.createRef<HTMLElement>();
    const inner = React.createRef<HTMLAnchorElement>();
    const calls: string[] = [];
    render(
      <Slot.Root ref={outer} className="outer" style={{ color: 'red' }} onClick={() => calls.push('outer')}>
        <a ref={inner} href="#slot" className="inner" style={{ backgroundColor: 'blue' }} onClick={() => calls.push('inner')}>
          Child content
        </a>
      </Slot.Root>,
    );
    const link = screen.getByRole('link', { name: 'Child content' });
    expect(outer.current).toBe(link);
    expect(inner.current).toBe(link);
    expect(link).toHaveClass('inner', 'outer');
    expect(link).toHaveStyle({ color: 'rgb(255, 0, 0)', backgroundColor: 'rgb(0, 0, 255)' });
    await userEvent.setup().click(link);
    expect(calls).toEqual(['inner', 'outer']);
    expect(link.parentElement?.tagName).toBe('DIV');
  });
  it('keeps button asChild content and never adds a nested button', () => {
    render(
      <Button asChild>
        <a href="#button">Button link</a>
      </Button>,
    );
    expect(screen.getByRole('link', { name: 'Button link' })).toHaveAttribute('href', '#button');
    expect(screen.queryByRole('button')).toBeNull();
  });
  it('allows empty conditional asChild content without creating a stray element', () => {
    const { container } = render(
      <>
        <Button asChild>{null}</Button>
        <Slot.Root>{null}</Slot.Root>
      </>,
    );
    expect(container).toBeEmptyDOMElement();
  });
  it('keeps native button refs, mixed checkbox state and boolean change callbacks', async () => {
    const changed = vi.fn();
    const ref = React.createRef<HTMLButtonElement>();
    render(<Checkbox ref={ref} defaultChecked="indeterminate" aria-label="Mixed selection" onCheckedChange={changed} />);
    const checkbox = screen.getByRole('checkbox', { name: 'Mixed selection' });
    expect(ref.current).toBe(checkbox);
    expect(checkbox.tagName).toBe('BUTTON');
    expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
    expect(checkbox).toHaveAttribute('data-state', 'indeterminate');
    await userEvent.setup().click(checkbox);
    expect(changed).toHaveBeenLastCalledWith(true);
    expect(checkbox).toHaveAttribute('data-state', 'checked');
  });
  it('honors controlled checkbox state and disabled controls', async () => {
    const changed = vi.fn();
    const { rerender } = render(<Checkbox checked={false} onCheckedChange={changed} aria-label="Controlled" />);
    await userEvent.setup().click(screen.getByRole('checkbox'));
    expect(changed).toHaveBeenCalledWith(true);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
    rerender(<Checkbox checked disabled onCheckedChange={changed} aria-label="Controlled" />);
    changed.mockClear();
    await userEvent.setup().click(screen.getByRole('checkbox'));
    expect(changed).not.toHaveBeenCalled();
  });
  it('toggles an uncontrolled switch with keyboard and preserves button semantics', async () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Switch ref={ref} aria-label="Notifications" />);
    const control = screen.getByRole('switch');
    expect(ref.current?.tagName).toBe('BUTTON');
    act(() => control.focus());
    await userEvent.setup().keyboard(' ');
    expect(control).toHaveAttribute('aria-checked', 'true');
  });
  it('navigates and selects radios in a direction-aware group', async () => {
    const changed = vi.fn();
    render(
      <DirectionProvider direction="rtl">
        <RadioGroup defaultValue="a" onValueChange={changed}>
          <RadioGroup.Item value="a" aria-label="Alpha" />
          <RadioGroup.Item value="b" aria-label="Beta" />
        </RadioGroup>
      </DirectionProvider>,
    );
    const alpha = screen.getByRole('radio', { name: 'Alpha' });
    act(() => alpha.focus());
    await userEvent.setup().keyboard('{ArrowLeft}');
    await waitFor(() => expect(screen.getByRole('radio', { name: 'Beta' })).toHaveAttribute('aria-checked', 'true'));
    expect(changed).toHaveBeenLastCalledWith('b');
  });
  it('keeps radio orientation and non-looping boundary behavior', async () => {
    render(
      <RadioGroup orientation="vertical" loop={false} defaultValue="b">
        <RadioGroup.Item value="a" aria-label="Alpha" />
        <RadioGroup.Item value="b" aria-label="Beta" />
      </RadioGroup>,
    );
    const beta = screen.getByRole('radio', { name: 'Beta' });
    act(() => beta.focus());
    await userEvent.setup().keyboard('{ArrowDown}');
    expect(beta).toHaveFocus();
    await userEvent.setup().keyboard('{ArrowLeft}');
    expect(beta).toHaveFocus();
    await userEvent.setup().keyboard('{ArrowUp}');
    expect(screen.getByRole('radio', { name: 'Alpha' })).toHaveFocus();
  });
  it('has a labeled initial select value before its popup has ever mounted', () => {
    render(
      <Select defaultValue="draft">
        <Select.Trigger aria-label="Status">
          <Select.Value placeholder="Choose status" />
        </Select.Trigger>
        <Select.Content>{selectOptions}</Select.Content>
      </Select>,
    );
    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveTextContent('Draft label');
  });
  it('preserves select placeholders, keyboard selection and string callbacks', async () => {
    const changed = vi.fn();
    render(
      <Select onValueChange={changed}>
        <Select.Trigger aria-label="Status">
          <Select.Value placeholder="Choose status" />
        </Select.Trigger>
        <Select.Content>{selectOptions}</Select.Content>
      </Select>,
    );
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveTextContent('Choose status');
    await userEvent.setup().click(trigger);
    await userEvent.setup().click(await screen.findByRole('option', { name: 'Published label' }));
    expect(changed).toHaveBeenLastCalledWith('published');
    expect(trigger).toHaveTextContent('Published label');
  });
  it('supports tabs manual activation without changing the existing string-value API', async () => {
    render(
      <Tabs defaultValue="one" activationMode="manual">
        <Tabs.List>
          <Tabs.Trigger value="one">One</Tabs.Trigger>
          <Tabs.Trigger value="two">Two</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="one">Panel one</Tabs.Content>
        <Tabs.Content value="two">Panel two</Tabs.Content>
      </Tabs>,
    );
    act(() => screen.getByRole('tab', { name: 'One' }).focus());
    await userEvent.setup().keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Two' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true');
    await userEvent.setup().keyboard('{Enter}');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel two');
  });
  it('adapts single and multiple progress accordions without changing value shapes', async () => {
    const changed = vi.fn();
    const { rerender } = render(
      <ProgressAccordion type="single" defaultValue="one" collapsible onValueChange={changed}>
        <ProgressAccordion.Item value="one">
          <ProgressAccordion.Header>First</ProgressAccordion.Header>
          <ProgressAccordion.Content>Details</ProgressAccordion.Content>
        </ProgressAccordion.Item>
      </ProgressAccordion>,
    );
    await userEvent.setup().click(screen.getByRole('button'));
    expect(changed).toHaveBeenLastCalledWith('');
    rerender(
      <ProgressAccordion key="multiple" type="multiple" onValueChange={changed}>
        <ProgressAccordion.Item value="one">
          <ProgressAccordion.Header>First</ProgressAccordion.Header>
          <ProgressAccordion.Content>Details</ProgressAccordion.Content>
        </ProgressAccordion.Item>
      </ProgressAccordion>,
    );
    await userEvent.setup().click(screen.getByRole('button'));
    expect(changed).toHaveBeenLastCalledWith(['one']);
  });
});

describe('Base UI-backed CMS surfaces', () => {
  it('keeps asChild trigger text, click handlers and default-prevented activation', async () => {
    render(
      <Popover>
        <Popover.Trigger asChild>
          <button onClick={(e) => e.preventDefault()}>Do not open</button>
        </Popover.Trigger>
        <Popover.Content>Should remain closed</Popover.Content>
      </Popover>,
    );
    await userEvent.setup().click(screen.getByRole('button', { name: 'Do not open' }));
    expect(screen.queryByText('Should remain closed')).not.toBeInTheDocument();
  });
  it('supports manual popover anchors and cancellable Escape/outside interactions', async () => {
    render(
      <Popover defaultOpen>
        <Popover.Anchor data-testid="anchor" />
        <Popover.Content onEscapeKeyDown={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()}>
          Retained popup
        </Popover.Content>
      </Popover>,
    );
    const content = await screen.findByText('Retained popup');
    await userEvent.setup().keyboard('{Escape}');
    expect(content).toBeInTheDocument();
    await userEvent.setup().click(document.body);
    expect(content).toBeInTheDocument();
  });
  it('keeps native positioners in the popup layer, not an auto/zero stacking context', async () => {
    render(
      <Popover defaultOpen>
        <Popover.Anchor />
        <Popover.Content style={{ zIndex: 123 }}>Layered popup</Popover.Content>
      </Popover>,
    );
    const popup = await screen.findByText('Layered popup');
    expect(popup).toHaveStyle({ zIndex: '123' });
    expect(popup.parentElement).toHaveStyle({ zIndex: '123' });
  });
  it('cancels menu dismissal without suppressing a checkbox value change', async () => {
    const changed = vi.fn();
    render(
      <DropdownMenu>
        <DropdownMenu.Trigger>Open choices</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Label>Standalone label</DropdownMenu.Label>
          <DropdownMenu.CheckboxItem onSelect={(e) => e.preventDefault()} onCheckedChange={changed}>
            Pin column
          </DropdownMenu.CheckboxItem>
        </DropdownMenu.Content>
      </DropdownMenu>,
    );
    await userEvent.setup().click(screen.getByRole('button', { name: 'Open choices' }));
    const item = await screen.findByRole('menuitemcheckbox', { name: 'Pin column' });
    await userEvent.setup().click(item);
    expect(changed).toHaveBeenLastCalledWith(true);
    expect(item).toBeInTheDocument();
    expect(item).toHaveAttribute('aria-checked', 'true');
  });
  it('maps the existing content loop option to native menu keyboard navigation', async () => {
    render(
      <DropdownMenu>
        <DropdownMenu.Trigger>Looping menu</DropdownMenu.Trigger>
        <DropdownMenu.Content loop>
          <DropdownMenu.Item>First command</DropdownMenu.Item>
          <DropdownMenu.Item>Last command</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>,
    );
    act(() => screen.getByRole('button', { name: 'Looping menu' }).focus());
    await userEvent.setup().keyboard('{ArrowDown}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'First command' })).toHaveFocus());
    await userEvent.setup().keyboard('{End}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Last command' })).toHaveFocus());
    await userEvent.setup().keyboard('{ArrowDown}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'First command' })).toHaveFocus());
  });
  it('preserves mixed menu checkbox semantics, visible indicators and boolean toggles', async () => {
    const changed = vi.fn();
    render(
      <DropdownMenu>
        <DropdownMenu.Trigger>Mixed menu</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.CheckboxItem checked="indeterminate" onSelect={(e) => e.preventDefault()} onCheckedChange={changed}>
            Mixed column
          </DropdownMenu.CheckboxItem>
        </DropdownMenu.Content>
      </DropdownMenu>,
    );
    await userEvent.setup().click(screen.getByRole('button', { name: 'Mixed menu' }));
    const item = await screen.findByRole('menuitemcheckbox', { name: 'Mixed column' });
    expect(item).toHaveAttribute('aria-checked', 'mixed');
    expect(item).toHaveAttribute('data-state', 'indeterminate');
    expect(item.querySelector('svg')).toBeInTheDocument();
    expect(item.querySelector('svg')?.closest('[hidden]')).toBeNull();
    await userEvent.setup().click(item);
    expect(changed).toHaveBeenLastCalledWith(true);
    expect(item).toBeInTheDocument();
  });
  it('closes an ordinary menu after selecting an item and sends a real cancellable event', async () => {
    const selected = vi.fn();
    render(
      <DropdownMenu>
        <DropdownMenu.Trigger>Open actions</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onSelect={selected}>Run action</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>,
    );
    await userEvent.setup().click(screen.getByRole('button', { name: 'Open actions' }));
    await userEvent.setup().click(await screen.findByRole('menuitem', { name: 'Run action' }));
    expect(selected).toHaveBeenCalledTimes(1);
    expect(selected.mock.calls[0]![0]).toBeInstanceOf(CustomEvent);
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });
  it('opens a context menu on a real context-menu event', async () => {
    render(
      <ContextMenu>
        <ContextMenu.Trigger>Context target</ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Item>Context action</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText('Context target'), { clientX: 40, clientY: 40 });
    expect(await screen.findByRole('menuitem', { name: 'Context action' })).toBeInTheDocument();
  });
  it('honors modal autofocus and Escape cancellation through the stable content callbacks', async () => {
    render(
      <Drawer defaultOpen>
        <Drawer.Content onOpenAutoFocus={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <Drawer.Title>CMS drawer</Drawer.Title>
          <Drawer.Description>Details</Drawer.Description>
          <button>First action</button>
        </Drawer.Content>
      </Drawer>,
    );
    const dialog = await screen.findByRole('dialog', { name: 'CMS drawer' });
    expect(screen.getByRole('button', { name: 'First action' })).not.toHaveFocus();
    await userEvent.setup().keyboard('{Escape}');
    expect(dialog).toBeInTheDocument();
  });
  it('does not paint a blocking backdrop for a nonmodal drawer', async () => {
    render(
      <Drawer defaultOpen modal={false}>
        <Drawer.Content>
          <Drawer.Title>Nonmodal drawer</Drawer.Title>
          <Drawer.Description>Background remains interactive</Drawer.Description>
        </Drawer.Content>
      </Drawer>,
    );
    await screen.findByRole('dialog', { name: 'Nonmodal drawer' });
    expect(document.querySelector('[data-ui-layer="modal-backdrop"]')).toBeNull();
  });
  it('supports tooltip Escape cancellation through the CMS content API', async () => {
    render(
      <Tooltip defaultOpen content="Retained tooltip" onEscapeKeyDown={(e) => e.preventDefault()}>
        <button>Tooltip trigger</button>
      </Tooltip>,
    );
    const tooltip = await screen.findByRole('tooltip');
    expect(screen.getByRole('button', { name: 'Tooltip trigger' })).toHaveAccessibleDescription('Retained tooltip');
    await userEvent.setup().keyboard('{Escape}');
    expect(tooltip).toBeInTheDocument();
  });
  it('keeps a prompt open when an action prevents its default close behavior', async () => {
    render(
      <Prompt defaultOpen>
        <Prompt.Content>
          <Prompt.Title>Async confirmation</Prompt.Title>
          <Prompt.Description>Keep pending work visible</Prompt.Description>
          <Prompt.Cancel>Cancel</Prompt.Cancel>
          <Prompt.Action onClick={(e) => e.preventDefault()}>Start pending action</Prompt.Action>
        </Prompt.Content>
      </Prompt>,
    );
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Start pending action' }));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });
});
