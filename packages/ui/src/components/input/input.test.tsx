import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { InputGroup, InputGroupAddon, InputGroupInput } from '../input-group/input-group';
import { Input } from './input';

afterEach(cleanup);

describe('primary Input integration', () => {
  it('keeps the original wrapper and supports layout-only wrapper classes', () => {
    render(<Input aria-label="Input" wrapperClassName="flex-1" />);
    expect(screen.getByRole('textbox').parentElement).toHaveClass('relative', 'flex-1');
    expect(screen.getByRole('textbox')).not.toHaveAttribute('wrapperClassName');
  });
  it('does not carry a stale text type into a password field', () => {
    const { rerender } = render(<Input aria-label="Password" type="text" />);
    rerender(<Input aria-label="Password" type="password" />);
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute('aria-pressed', 'true');
  });
  it('hides its decorative search icon from assistive technology', () => {
    render(<Input type="search" aria-label="Search" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Search' })).toBeInTheDocument();
  });
  it('disables password reveal along with the field', () => {
    render(<Input type="password" aria-label="Password" disabled />);
    expect(screen.getByRole('button', { name: 'Show password' })).toBeDisabled();
  });
  it('gives compact input groups the primary small size and flexible wrapper', () => {
    render(
      <InputGroup density="compact">
        <InputGroupAddon>https://</InputGroupAddon>
        <InputGroupInput aria-label="Address" />
      </InputGroup>,
    );
    const input = screen.getByRole('textbox', { name: 'Address' });
    expect(input.parentElement).toHaveClass('flex-1', 'min-w-0');
    expect(input).toHaveClass('ui-control-text', 'py-0', 'h-full');
    fireEvent.click(screen.getByText('https://'));
    expect(input).toHaveFocus();
  });
});
