import { render, screen } from '@testing-library/react';
import { mockStore } from '../../setupTests';
import { Providers } from '../../src/app/providers';
import AccountView from '../../src/components/account/AccountView';

describe('Account View', () => {
  it('should display account name, balance, Savings chart, and ledger table for Savings account', async () => {
    // Setup: Create parent and child first
    mockStore.set(
      'PARENT.txt',
      JSON.stringify({ name: 'Test Parent', children: ['emma'] })
    );
    
    mockStore.set(
      'CHILD-emma.txt',
      JSON.stringify({
        name: 'Emma',
        accounts: ['savings'],
        cb: 60,
        cbts: Date.now()
      })
    );

    mockStore.set(
      'ACCOUNT-emma-savings.txt',
      JSON.stringify({
        name: 'Savings',
        type: 'Savings',
        allowance: { enabled: true, amount: 10, frequency: 'weekly' },
        interest: { enabled: false },
        ledger: [
          { timestamp: Date.now() - 86400000, type: 'Deposit', description: 'Birthday', value: 50 },
          { timestamp: Date.now(), type: 'Deposit', description: 'Chores', value: 10 }
        ]
      })
    );

    render(
      <Providers>
        <AccountView childName="emma" accountName="savings" />
      </Providers>
    );

    // Expect account name in header
    expect(await screen.findByRole('heading', { name: /^Savings$/i, level: 1 })).toBeInTheDocument();

    // Expect balance display
    expect(screen.getByText('$60.00')).toBeInTheDocument();

    // Expect chart section
    expect(screen.getByText(/Savings Progression/i)).toBeInTheDocument();

    // Expect action buttons
    expect(screen.getByRole('button', { name: /Deposit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Withdraw/i })).toBeInTheDocument();

    // Expect ledger entries
    expect(screen.getByText(/Birthday/i)).toBeInTheDocument();
    expect(screen.getByText(/Chores/i)).toBeInTheDocument();
  });

  it('should display goal progress bar for Goal account instead of chart', async () => {
    // Setup: Create parent and child
    mockStore.set(
      'PARENT.txt',
      JSON.stringify({ name: 'Test Parent', children: ['emma'] })
    );
    
    mockStore.set(
      'CHILD-emma.txt',
      JSON.stringify({
        name: 'Emma',
        accounts: ['bike'],
        cb: 75,
        cbts: Date.now()
      })
    );

    mockStore.set(
      'ACCOUNT-emma-bike.txt',
      JSON.stringify({
        name: 'Bike Fund',
        type: 'Goal',
        allowance: { enabled: false },
        interest: { enabled: false },
        goal: { name: 'New Bike', cost: 200, achieved: false },
        ledger: [
          { timestamp: Date.now(), type: 'Deposit', description: 'Saved', value: 75 }
        ]
      })
    );

    render(
      <Providers>
        <AccountView childName="emma" accountName="bike" />
      </Providers>
    );

    // Goal accounts display the goal name as title, not the account name
    expect(await screen.findByRole('heading', { name: /New Bike Goal/i, level: 1 })).toBeInTheDocument();
    
    // Expect goal amounts (both appear in the interface)
    expect(screen.getByText('$200.00')).toBeInTheDocument(); // Goal amount
    expect(screen.getAllByText('$75.00').length).toBeGreaterThan(0); // Saved amount (appears multiple times: balance + goal detail)
    
    // Expect progress indicator showing remaining amount
    expect(screen.getByText(/\$125.00\s+left to save/i)).toBeInTheDocument();
  });
});

