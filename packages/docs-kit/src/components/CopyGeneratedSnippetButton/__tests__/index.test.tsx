import { render } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import type { UseGenerateSnippet } from '../../../hooks/use-generate-snippet';
import type { CopyButtonProps } from '../../CopyButton';

// mock data
const mockUseGenerateSnippetProps: UseGenerateSnippet = {
  type: 'subscriber',
  options: {
    event: 'order.placed',
    payload: {
      id: 'order_123',
    },
  },
};
const defaultUseGenerateSnippetReturn = {
  snippet: "const snippet = 'snippet'",
};

// mock functions
const mockUseGenerateSnippet = vi.fn(() => defaultUseGenerateSnippetReturn);

// mock components
vi.mock('@/hooks/use-generate-snippet', () => ({
  useGenerateSnippet: () => mockUseGenerateSnippet(),
}));
vi.mock('@/components/CopyButton', () => ({
  CopyButton: ({ children, text }: CopyButtonProps) => (
    <div data-testid="copy-button" data-text={text}>
      {typeof children === 'function' ? children({ isCopied: false }) : children}
    </div>
  ),
}));

import { CopyGeneratedSnippetButton } from '../../CopyGeneratedSnippetButton';

describe('render', () => {
  test('renders copy generated snippet button', () => {
    const { container } = render(<CopyGeneratedSnippetButton {...mockUseGenerateSnippetProps} />);
    const copyButton = container.querySelector("[data-testid='copy-button']");
    expect(copyButton).toBeInTheDocument();
    expect(copyButton).toHaveAttribute('data-text', defaultUseGenerateSnippetReturn.snippet);
  });
});
