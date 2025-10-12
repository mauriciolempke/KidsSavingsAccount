import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockStore } from '../../setupTests';
import { Providers } from '../../src/app/providers';
import TransferForm from '../../src/components/forms/TransferForm';

describe('Transfer - Same Account Rejection', () => {
  beforeEach(() => {
    mockStore.clear();
    mockStore.set(
      'PARENT.txt',
      JSON.stringify({ name: 'Test Parent', children: ['emma'] })
    );
    mockStore.set(
      'CHILD-emma.txt',
      JSON.stringify({
        name: 'Emma',
        accounts: ['savings', 'bikefund'],
        cb: 100,
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
          { timestamp: Date.now(), type: 'Deposit', description: 'Initial', value: 100 }
        ]
      })
    );
    mockStore.set(
      'ACCOUNT-emma-bikefund.txt',
      JSON.stringify({
        name: 'BikeFund',
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
    render(
      <Providers>
        <TransferForm 
          childName="emma" 
          onSuccess={() => {}} 
          onCancel={() => {}} 
        />
      </Providers>
    );

    const fromSelect = await screen.findByRole('combobox', { name: /from account/i });
    await user.selectOptions(fromSelect, 'Savings');

    const toSelect = await screen.findByRole('combobox', { name: /to account/i });
    await user.selectOptions(toSelect, 'Savings'); // Same account

    const amountInput = await screen.findByRole('spinbutton', { name: /amount/i });
    await user.type(amountInput, '10');

    const submitButton = await screen.findByRole('button', { name: 'Transfer' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/cannot transfer to the same account/i)).toBeInTheDocument();
    });
  });

  it('should disable submit button when from and to accounts are the same', async () => {
    const user = userEvent.setup();
    render(
      <Providers>
        <TransferForm 
          childName="emma" 
          onSuccess={() => {}} 
          onCancel={() => {}} 
        />
      </Providers>
    );

    const fromSelect = await screen.findByRole('combobox', { name: /from account/i });
    await user.selectOptions(fromSelect, 'Savings');

    const toSelect = await screen.findByRole('combobox', { name: /to account/i });
    await user.selectOptions(toSelect, 'Savings');

    const submitButton = await screen.findByRole('button', { name: /transfer|submit/i });
    expect(submitButton).toBeDisabled();
  });
});

