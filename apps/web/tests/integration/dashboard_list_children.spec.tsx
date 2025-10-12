import { render, screen } from '@testing-library/react';
import Home from '../../src/app/page';
import { Providers } from '../../src/app/providers';
import { mockStore } from '../../setupTests';

describe('Dashboard - List Children with Totals', () => {
  it('should display children with their total balances excluding Achieved goals', async () => {
    // Setup: Parent with two children having various accounts
    mockStore.set(
      'PARENT.txt',
      JSON.stringify({ name: 'Alex', children: ['emma', 'noah'] })
    );

    mockStore.set(
      'CHILD-emma.txt',
      JSON.stringify({
        name: 'Emma',
        accounts: ['savings', 'bike'],
        cb: 150,
        cbts: Date.now()
      })
    );

    mockStore.set(
      'ACCOUNT-emma-savings.txt',
      JSON.stringify({
        name: 'Savings',
        type: 'Savings',
        allowance: { enabled: false },
        interest: { enabled: false },
        ledger: [
          { timestamp: Date.now(), type: 'Deposit', description: 'Birthday', value: 100 }
        ]
      })
    );

    mockStore.set(
      'ACCOUNT-emma-bike.txt',
      JSON.stringify({
        name: 'Bike',
        type: 'Goal',
        allowance: { enabled: false },
        interest: { enabled: false },
        goal: { name: 'New Bike', cost: 200, achieved: true },
        ledger: [
          { timestamp: Date.now(), type: 'Deposit', description: 'Saved up', value: 50 }
        ]
      })
    );

    render(
      <Providers>
        <Home />
      </Providers>
    );

    // Expect Emma to be listed
    expect(await screen.findByText(/Emma/i)).toBeInTheDocument();
    
    // Expect total to exclude the achieved goal (only $100 from savings, not $50 from bike)
    expect(await screen.findByText(/\$100/)).toBeInTheDocument();
  });
});

