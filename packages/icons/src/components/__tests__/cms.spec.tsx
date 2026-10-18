import { cleanup, render, screen } from '@testing-library/react';
import CMS from '../cms';

describe('CMS', () => {
  it('should render the icon without errors', async () => {
    render(<CMS data-testid="icon" />);

    const svgElement = screen.getByTestId('icon');

    expect(svgElement).toBeInTheDocument();

    cleanup();
  });
});
