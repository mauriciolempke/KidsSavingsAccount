import { render, screen } from '@testing-library/react';
import Home from '../../src/app/page';
import { Providers } from '../../src/app/providers';
import { mockStore } from '../../setupTests';

describe('Startup - Returning User', () => {
  it('should show greeting with parent name and auto-navigate to Dashboard', async () => {
    // Arrange: simulate existing PARENT.txt in mock IndexedDB
    mockStore.set(
      'PARENT.txt',
      JSON.stringify({ name: 'Alex', children: [] })
    );
    
    render(
      <Providers>
        <Home />
      </Providers>
    );

    // Wait for async loading and expect to see the dashboard (not "Loading...")
    // For a returning user, we should see something other than onboarding
    await screen.findByText(/Alex/i);
    
    // The dashboard should be displayed (not loading, not onboarding)
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
});


