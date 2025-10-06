import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockTransferPage = () => <div>Transfer Mock</div>;

describe('Transfer Between Accounts', () => {
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
          { timestamp: Date.now(), type: 'Deposit', description: 'Initial', value: 100 }
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
        goal: { name: 'New Bike', cost: 200, achieved: false },
        ledger: []
      })
    );
  });

  it('should post withdraw from source and deposit to target', async () => {
    const user = userEvent.setup();
    render(mockTransferPage());

    // Select from account
    const fromSelect = await screen.findByRole('combobox', { name: /from account/i });
    await user.selectOptions(fromSelect, 'Savings');

    // Select to account
    const toSelect = await screen.findByRole('combobox', { name: /to account/i });
    await user.selectOptions(toSelect, 'Bike Fund');

    // Enter amount
    const amountInput = await screen.findByRole('spinbutton', { name: /amount/i });
    await user.type(amountInput, '50');

    // Submit
    const submitButton = await screen.findByRole('button', { name: /transfer|submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/transfer.*successful|completed/i)).toBeInTheDocument();
    });
  });

  it('should cap transfer amount to available balance with toast', async () => {
    const user = userEvent.setup();
    render(mockTransferPage());

    const fromSelect = await screen.findByRole('combobox', { name: /from account/i });
    await user.selectOptions(fromSelect, 'Savings');

    const toSelect = await screen.findByRole('combobox', { name: /to account/i });
    await user.selectOptions(toSelect, 'Bike Fund');

    // Try to transfer more than available (100)
    const amountInput = await screen.findByRole('spinbutton', { name: /amount/i });
    await user.type(amountInput, '150');

    const submitButton = await screen.findByRole('button', { name: /transfer|submit/i });
    await user.click(submitButton);

    // Expect toast notification
    await waitFor(() => {
      expect(screen.getByText(/adjusted to available|capped to balance/i)).toBeInTheDocument();
    });
  });

  it('should reject zero or negative transfer amounts', async () => {
    const user = userEvent.setup();
    render(mockTransferPage());

    const fromSelect = await screen.findByRole('combobox', { name: /from account/i });
    await user.selectOptions(fromSelect, 'Savings');

    const toSelect = await screen.findByRole('combobox', { name: /to account/i });
    await user.selectOptions(toSelect, 'Bike Fund');

    const amountInput = await screen.findByRole('spinbutton', { name: /amount/i });
    await user.type(amountInput, '0');

    const submitButton = await screen.findByRole('button', { name: /transfer|submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/must be greater than zero|positive amount/i)).toBeInTheDocument();
    });
  });
});

