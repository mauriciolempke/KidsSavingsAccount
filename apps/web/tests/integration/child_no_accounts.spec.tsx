import { render, screen } from '@testing-library/react';

// Mock child dashboard page component
const mockChildPage = () => <div>Child Dashboard</div>;

describe('Child Dashboard - No Accounts', () => {
  it('should display guidance to add an account when child has no accounts', async () => {
    window.localStorage.setItem(
      'PARENT.txt',
      JSON.stringify({ name: 'Alex', children: ['emma'] })
    );

    window.localStorage.setItem(
      'CHILD-emma.txt',
      JSON.stringify({
        name: 'Emma',
        accounts: [],
        cb: 0,
        cbts: Date.now()
      })
    );

    // This test requires the child dashboard route to exist
    // For now, we'll test the expected behavior
    render(mockChildPage());

    // Expect guidance text
    expect(screen.getByText(/add an account|create first account|no accounts yet/i)).toBeInTheDocument();
  });
});

