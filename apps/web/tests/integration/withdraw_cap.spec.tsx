import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockAccountPage = () => <div>Account View Mock</div>;

describe('Withdraw - Overdraw Auto-Cap', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem(
      'ACCOUNT-emma-savings.txt',
      JSON.stringify({
        name: 'Savings',
        type: 'Savings',
        allowance: { enabled: false },
        interest: { enabled: false },
        ledger: [
          { timestamp: Date.now(), type: 'Deposit', description: 'Initial', value: 50 }
        ]
      })
    );
  });

  it('should auto-cap withdraw amount to available balance with toast notification', async () => {
    const user = userEvent.setup();
    render(mockAccountPage());

    const withdrawButton = await screen.findByRole('button', { name: /withdraw/i });
    await user.click(withdrawButton);

    const amountInput = await screen.findByRole('spinbutton', { name: /amount/i });
    await user.type(amountInput, '100'); // More than available (50)

    const descInput = await screen.findByRole('textbox', { name: /description/i });
    await user.type(descInput, 'Toy');

    const submitButton = await screen.findByRole('button', { name: /submit|confirm/i });
    await user.click(submitButton);

    // Expect toast notification about capping
    await waitFor(() => {
      expect(screen.getByText(/adjusted to available|capped.*\$50/i)).toBeInTheDocument();
    });

    // Verify withdrawal was capped to $50
    const accountData = JSON.parse(window.localStorage.getItem('ACCOUNT-emma-savings.txt') || '{}');
    const lastEntry = accountData.ledger[accountData.ledger.length - 1];
    expect(Math.abs(lastEntry.value)).toBe(50);
  });

  it('should allow withdrawal of exact available balance without toast', async () => {
    const user = userEvent.setup();
    render(mockAccountPage());

    const withdrawButton = await screen.findByRole('button', { name: /withdraw/i });
    await user.click(withdrawButton);

    const amountInput = await screen.findByRole('spinbutton', { name: /amount/i });
    await user.type(amountInput, '50'); // Exactly available

    const descInput = await screen.findByRole('textbox', { name: /description/i });
    await user.type(descInput, 'Toy');

    const submitButton = await screen.findByRole('button', { name: /submit|confirm/i });
    await user.click(submitButton);

    // Should succeed without toast
    await waitFor(() => {
      expect(screen.queryByText(/adjusted|capped/i)).not.toBeInTheDocument();
    });
  });

  it('should prevent negative balance', async () => {
    const user = userEvent.setup();
    render(mockAccountPage());

    const withdrawButton = await screen.findByRole('button', { name: /withdraw/i });
    await user.click(withdrawButton);

    const amountInput = await screen.findByRole('spinbutton', { name: /amount/i });
    await user.type(amountInput, '75'); // More than available

    const submitButton = await screen.findByRole('button', { name: /submit|confirm/i });
    await user.click(submitButton);

    // After capping, balance should be 0, not negative
    const accountData = JSON.parse(window.localStorage.getItem('ACCOUNT-emma-savings.txt') || '{}');
    const balance = accountData.ledger.reduce((sum: number, entry: any) => sum + entry.value, 0);
    expect(balance).toBeGreaterThanOrEqual(0);
  });
});

