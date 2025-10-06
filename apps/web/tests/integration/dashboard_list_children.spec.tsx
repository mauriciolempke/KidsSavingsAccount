import { render, screen } from '@testing-library/react';
import Home from '../../src/app/page';

describe('Dashboard - List Children with Totals', () => {
  it('should display children with their total balances excluding Achieved goals', async () => {
    // Setup: Parent with two children having various accounts
    window.localStorage.setItem(
      'PARENT.txt',
      JSON.stringify({ name: 'Alex', children: ['emma', 'noah'] })
    );

    window.localStorage.setItem(
      'CHILD-emma.txt',
      JSON.stringify({
        name: 'Emma',
        accounts: ['savings', 'bike'],
        cb: 150,
        cbts: Date.now()
      })
    );

    window.localStorage.setItem(
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

    window.localStorage.setItem(
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

    render(<Home />);

    // Expect Emma to be listed
    expect(await screen.findByText(/Emma/i)).toBeInTheDocument();
    
    // Expect total to exclude the achieved goal (only $100 from savings, not $50 from bike)
    expect(await screen.findByText(/\$100/)).toBeInTheDocument();
  });
});

