import { render, screen } from '@testing-library/react';
import Home from '../../src/app/page';

describe('Startup - Returning User', () => {
  it('should show greeting with parent name and auto-navigate to Dashboard', async () => {
    // Arrange: simulate existing PARENT.txt
    window.localStorage.setItem(
      'PARENT.txt',
      JSON.stringify({ name: 'Alex', children: [] })
    );
    render(<Home />);

    // Expect greeting (will fail until implemented)
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });
});


