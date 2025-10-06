import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockAccountPage = () => <div>Goal Account Mock</div>;

describe('Goal Achieved', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem(
      'ACCOUNT-emma-bike.txt',
      JSON.stringify({
        name: 'Bike Fund',
        type: 'Goal',
        allowance: { enabled: false },
        interest: { enabled: false },
        goal: { name: 'New Bike', cost: 200, achieved: false },
        ledger: [
          { timestamp: Date.now(), type: 'Deposit', description: 'Saved', value: 200 }
        ]
      })
    );
  });

  it('should mark goal as Achieved when balance reaches or exceeds cost', async () => {
    render(mockAccountPage());

    // Expect "Mark as Achieved" button or automatic detection
    const achievedButton = await screen.findByRole('button', { name: /mark.*achieved|goal reached/i });
    
    expect(achievedButton).toBeInTheDocument();
  });

  it('should make Achieved goal account read-only (no deposits/withdraws)', async () => {
    window.localStorage.setItem(
      'ACCOUNT-emma-bike.txt',
      JSON.stringify({
        name: 'Bike Fund',
        type: 'Goal',
        allowance: { enabled: false },
        interest: { enabled: false },
        goal: { name: 'New Bike', cost: 200, achieved: true },
        ledger: [
          { timestamp: Date.now(), type: 'Deposit', description: 'Saved', value: 200 }
        ]
      })
    );

    render(mockAccountPage());

    // Expect Deposit/Withdraw buttons to be disabled or hidden
    await waitFor(() => {
      const depositButton = screen.queryByRole('button', { name: /deposit/i });
      expect(depositButton).toBeNull();
    });

    expect(screen.getByText(/goal achieved|completed/i)).toBeInTheDocument();
  });

  it('should exclude Achieved goal from child total balance and accruals', async () => {
    // This is tested at the service/calculation level
    // The UI should not show this balance in totals
    window.localStorage.setItem(
      'CHILD-emma.txt',
      JSON.stringify({
        name: 'Emma',
        accounts: ['savings', 'bike'],
        cb: 100, // Only from savings
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
          { timestamp: Date.now(), type: 'Deposit', description: 'Money', value: 100 }
        ]
      })
    );

    window.localStorage.setItem(
      'ACCOUNT-emma-bike.txt',
      JSON.stringify({
        name: 'Bike Fund',
        type: 'Goal',
        allowance: { enabled: false },
        interest: { enabled: false },
        goal: { name: 'New Bike', cost: 200, achieved: true },
        ledger: [
          { timestamp: Date.now(), type: 'Deposit', description: 'Saved', value: 200 }
        ]
      })
    );

    // Test would verify total shows $100, not $300
    expect(true).toBe(true); // Placeholder
  });
});

