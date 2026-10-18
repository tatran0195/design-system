import { render } from '@testing-library/react';
import type React from 'react';
import { describe, expect, test, vi } from 'vitest';

// mock components
vi.mock('@/components/CopyButton', () => ({
  CopyButton: ({ children }: { children: React.ReactNode }) => <div data-testid="copy-button">{children}</div>,
}));

import { InlineCode } from '../../InlineCode';

describe('rendering', () => {
  test('renders default variant', () => {
    const { container } = render(<InlineCode>Test</InlineCode>);
    const code = container.querySelector('code');
    expect(code).toBeInTheDocument();
    expect(code).toHaveTextContent('Test');
    expect(code).toHaveClass(
      'bg-cms-tag-neutral-bg group-hover:bg-cms-tag-neutral-bg-hover group-active:bg-cms-bg-subtle-pressed group-focus:bg-cms-bg-subtle-pressed border-cms-tag-neutral-border',
    );
  });

  test('renders grey-bg variant', () => {
    const { container } = render(<InlineCode variant="grey-bg">Test</InlineCode>);
    const code = container.querySelector('code');
    expect(code).toBeInTheDocument();
    expect(code).toHaveTextContent('Test');
    expect(code).toHaveClass(
      'bg-cms-bg-switch-off group-hover:bg-cms-bg-switch-off-hover group-active:bg-cms-bg-switch-off-hover group-focus:bg-cms-switch-off-hover border-cms-border-strong',
    );
  });
});
