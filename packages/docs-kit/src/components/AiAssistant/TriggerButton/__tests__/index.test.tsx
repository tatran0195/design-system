import { fireEvent, render } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { ButtonProps } from '../../../Button';
import type { KbdProps } from '../../../Kbd';
import type { TooltipProps } from '../../../Tooltip';
import * as AiAssistantMocks from '../../__mocks__';

// mock functions
const mockSetIsSearchOpen = vi.fn();
const mockGetOsShortcut = vi.fn(() => 'Ctrl');
const defaultUseKeyboardShortcutReturn = {
  metakey: true,
  shortcutKeys: ['i'],
  action: vi.fn(),
  checkEditing: false,
};
const mockUseKeyboardShortcut = vi.fn(() => defaultUseKeyboardShortcutReturn);

// Mock components and hooks
vi.mock('@/components/Button', () => ({
  Button: (props: ButtonProps) => <button {...props} />,
}));
vi.mock('@/components/Tooltip', () => ({
  Tooltip: (props: TooltipProps) => (
    <div>
      {/* @ts-expect-error - props.render is not typed properly */}
      <div>{props.render?.()}</div>
      <div>{props.tooltipChildren}</div>
      <div>{props.children}</div>
    </div>
  ),
}));
vi.mock('@/components/Kbd', () => ({
  Kbd: (props: KbdProps) => <kbd {...props} />,
}));
vi.mock('@/components/Icons', () => ({
  BloomIcon: () => <span>BloomIcon</span>,
}));
vi.mock('@/providers/AiAssistant', () => ({
  useAiAssistant: () => AiAssistantMocks.mockUseAiAssistant(),
}));
vi.mock('@/providers/Search', () => ({
  useSearch: () => ({
    setIsOpen: mockSetIsSearchOpen,
  }),
}));
vi.mock('@/providers/SiteConfig', () => ({
  useSiteConfig: () => ({
    config: {
      basePath: 'https://docs.cms.com',
    },
  }),
}));
vi.mock('@/utils/os-browser-utils', () => ({
  getOsShortcut: () => mockGetOsShortcut(),
}));
vi.mock('@/hooks/use-keyboard-shortcut', () => ({
  useKeyboardShortcut: () => mockUseKeyboardShortcut(),
}));

beforeEach(() => {
  mockSetIsSearchOpen.mockClear();
  mockGetOsShortcut.mockClear();
  mockUseKeyboardShortcut.mockReturnValue(defaultUseKeyboardShortcutReturn);
  AiAssistantMocks.mockSetChatOpened.mockClear();
  AiAssistantMocks.mockUseAiAssistant.mockReturnValue(AiAssistantMocks.defaultUseAiAssistantReturn);
});

import { AiAssistantTriggerButton } from '../../TriggerButton';

describe('rendering', () => {
  test('renders the trigger button', () => {
    const { container } = render(<AiAssistantTriggerButton />);
    expect(container).toBeInTheDocument();
    expect(container).toHaveTextContent('Ask Bloom');
  });
  test('renders the trigger button with correct OS shortcut', () => {
    const { container } = render(<AiAssistantTriggerButton />);
    expect(container).toBeInTheDocument();
    const kbd = container.querySelectorAll('kbd');
    expect(kbd.length).toBe(2);
    expect(kbd[0]).toBeInTheDocument();
    expect(kbd[0]).toHaveTextContent('Ctrl');
    expect(kbd[1]).toBeInTheDocument();
    expect(kbd[1]).toHaveTextContent('i');
  });
});

describe('interactions', () => {
  test('clicking the trigger button should toggle the chat', () => {
    const { container } = render(<AiAssistantTriggerButton />);
    expect(container).toBeInTheDocument();
    const button = container.querySelector('button');
    expect(button).toBeInTheDocument();

    fireEvent.click(button!);
    expect(AiAssistantMocks.mockSetChatOpened).toHaveBeenCalledTimes(1);
  });
});
