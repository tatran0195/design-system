import { render } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// mock data
const mockColorMode = 'light';

// mock functions
const mockUseColorMode = vi.fn(() => ({
  colorMode: mockColorMode,
}));

// mock components
vi.mock('@/providers/ColorMode', () => ({
  useColorMode: () => mockUseColorMode(),
}));

import { CodeBlockHeaderWrapper } from '../index';

beforeEach(() => {
  mockUseColorMode.mockReturnValue({
    colorMode: mockColorMode,
  });
});

describe('render', () => {
  test('render with children, blockStyle loud, and colorMode light', () => {
    const { container } = render(<CodeBlockHeaderWrapper blockStyle="loud">Hello</CodeBlockHeaderWrapper>);
    expect(container).toBeInTheDocument();
    const wrapper = container.querySelector('div');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass('bg-cms-contrast-bg-base');
    expect(wrapper).not.toHaveClass('bg-cms-bg-component');
    expect(wrapper).not.toHaveClass('border-cms-border-base');
  });

  test('render with children, blockStyle subtle, and colorMode light', () => {
    const { container } = render(<CodeBlockHeaderWrapper blockStyle="subtle">Hello</CodeBlockHeaderWrapper>);
    expect(container).toBeInTheDocument();
    const wrapper = container.querySelector('div');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass('bg-cms-bg-component');
    expect(wrapper).not.toHaveClass('bg-cms-code-bg-header');
    expect(wrapper).not.toHaveClass('bg-cms-contrast-bg-base');
  });

  test('render with children, blockStyle subtle, and colorMode dark', () => {
    mockUseColorMode.mockReturnValue({
      colorMode: 'dark',
    });
    const { container } = render(<CodeBlockHeaderWrapper blockStyle="subtle">Hello</CodeBlockHeaderWrapper>);
    expect(container).toBeInTheDocument();
    const wrapper = container.querySelector('div');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass('bg-cms-code-bg-header');
    expect(wrapper).not.toHaveClass('bg-cms-bg-component');
    expect(wrapper).not.toHaveClass('bg-cms-contrast-bg-base');
  });
});
