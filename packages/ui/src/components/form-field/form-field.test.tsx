import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { FieldError } from './form-field';

afterEach(cleanup);

describe('FieldError', () => {
  it('filters empty values and accepts schema issues without repeating messages', () => {
    render(
      <FieldError
        id="email-error"
        errors={[' Invalid email ', { message: 'Invalid email' }, null, { message: undefined }, '', ' ', { message: 'Required' }]}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email, Required');
    expect(screen.getByRole('alert')).toHaveAttribute('id', 'email-error');
  });
  it('renders nothing for a valid field', () => {
    const { container } = render(<FieldError errors={[undefined, null, { message: undefined }]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
