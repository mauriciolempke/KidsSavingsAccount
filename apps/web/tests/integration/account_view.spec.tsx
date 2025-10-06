import { render, screen } from '@testing-library/react';

const mockAccountPage = () => <div>Account View Mock</div>;

describe('Account View', () => {
  it('should display account name, balance, Savings chart, and ledger table for Savings account', async () => {
    window.localStorage.setItem(
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

    render(mockAccountPage());

    // Expect account name
    expect(await screen.findByText(/Savings/i)).toBeInTheDocument();

    // Expect balance display
    expect(await screen.findByText(/\$60|Balance.*60/i)).toBeInTheDocument();

    // Expect chart (could be canvas or svg)
    expect(screen.getByRole('img', { name: /chart|graph/i }) || document.querySelector('svg')).toBeInTheDocument();

    // Expect ledger table
    expect(screen.getByText(/Birthday/i)).toBeInTheDocument();
    expect(screen.getByText(/Chores/i)).toBeInTheDocument();
  });

  it('should display goal progress bar for Goal account instead of chart', async () => {
    window.localStorage.setItem(
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

    render(mockAccountPage());

    expect(await screen.findByText(/Bike Fund/i)).toBeInTheDocument();
    expect(await screen.findByText(/New Bike/i)).toBeInTheDocument();
    
    // Expect progress indicator (75/200 = 37.5%)
    expect(screen.getByRole('progressbar') || screen.getByText(/\$75.*\$200|75.*200/)).toBeInTheDocument();
  });
});

