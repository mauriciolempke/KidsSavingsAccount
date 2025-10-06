import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockTransferPage = () => <div>Transfer Mock</div>;

describe('Transfer - Same Account Rejection', () => {
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

  it('should reject transfer when from and to accounts are the same', async () => {
    const user = userEvent.setup();
    render(mockTransferPage());

    const fromSelect = await screen.findByRole('combobox', { name: /from account/i });
    await user.selectOptions(fromSelect, 'Savings');

    const toSelect = await screen.findByRole('combobox', { name: /to account/i });
    await user.selectOptions(toSelect, 'Savings'); // Same account

    const amountInput = await screen.findByRole('spinbutton', { name: /amount/i });
    await user.type(amountInput, '10');

    const submitButton = await screen.findByRole('button', { name: /transfer|submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/cannot transfer to same account|different accounts/i)).toBeInTheDocument();
    });
  });

  it('should disable submit button when from and to accounts are the same', async () => {
    const user = userEvent.setup();
    render(mockTransferPage());

    const fromSelect = await screen.findByRole('combobox', { name: /from account/i });
    await user.selectOptions(fromSelect, 'Savings');

    const toSelect = await screen.findByRole('combobox', { name: /to account/i });
    await user.selectOptions(toSelect, 'Savings');

    const submitButton = await screen.findByRole('button', { name: /transfer|submit/i });
    expect(submitButton).toBeDisabled();
  });
});

