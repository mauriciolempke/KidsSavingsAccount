import { render, screen } from '@testing-library/react';
import Home from '../../src/app/page';

describe('Startup - First Time', () => {
  it('should show welcome/tutorial and prompt for parent name, then proceed to Dashboard on confirm', async () => {
    render(<Home />);

    // Expect welcome/tutorial content (will fail until implemented)
    expect(
      screen.getByText(/welcome to kids savings bank/i)
    ).toBeInTheDocument();

    // Expect a prompt to enter parent name (input) and a continue button
    expect(screen.getByRole('textbox', { name: /parent name/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
  });
});


