import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockAccountPage = () => <div>Account View Mock</div>;

describe('Deposit and Withdraw', () => {
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
          { timestamp: Date.now() - 86400000, type: 'Deposit', description: 'Initial', value: 100 }
        ]
      })
    );
  });

  it('should append Deposit to ledger, run Balance Calculation, and update UI', async () => {
    const user = userEvent.setup();
    render(mockAccountPage());

    // Click Deposit button
    const depositButton = await screen.findByRole('button', { name: /deposit/i });
    await user.click(depositButton);

    // Fill in deposit form
    const amountInput = await screen.findByRole('spinbutton', { name: /amount/i });
    await user.type(amountInput, '25');

    const descInput = await screen.findByRole('textbox', { name: /description/i });
    await user.type(descInput, 'Chores');

    const submitButton = await screen.findByRole('button', { name: /submit|confirm|add/i });
    await user.click(submitButton);

    // Expect ledger to update
    await waitFor(() => {
      expect(screen.getByText(/Chores/i)).toBeInTheDocument();
    });

    // Expect balance to update (100 + 25 = 125)
    expect(screen.getByText(/\$125|Balance.*125/)).toBeInTheDocument();
  });

  it('should append Withdraw to ledger and update balance', async () => {
    const user = userEvent.setup();
    render(mockAccountPage());

    const withdrawButton = await screen.findByRole('button', { name: /withdraw/i });
    await user.click(withdrawButton);

    const amountInput = await screen.findByRole('spinbutton', { name: /amount/i });
    await user.type(amountInput, '30');

    const descInput = await screen.findByRole('textbox', { name: /description/i });
    await user.type(descInput, 'Toy purchase');

    const submitButton = await screen.findByRole('button', { name: /submit|confirm/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Toy purchase/i)).toBeInTheDocument();
    });

    // Expect balance to update (100 - 30 = 70)
    expect(screen.getByText(/\$70|Balance.*70/)).toBeInTheDocument();
  });

  it('should reject zero or negative amounts', async () => {
    const user = userEvent.setup();
    render(mockAccountPage());

    const depositButton = await screen.findByRole('button', { name: /deposit/i });
    await user.click(depositButton);

    const amountInput = await screen.findByRole('spinbutton', { name: /amount/i });
    await user.clear(amountInput);
    await user.type(amountInput, '0');

    const submitButton = await screen.findByRole('button', { name: /submit|confirm|add/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/must be greater than zero|positive amount/i)).toBeInTheDocument();
    });
  });
});

