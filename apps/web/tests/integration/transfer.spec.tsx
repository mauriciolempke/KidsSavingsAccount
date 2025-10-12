import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockStore } from '../../setupTests';
import { Providers } from '../../src/app/providers';
import TransferForm from '../../src/components/forms/TransferForm';

describe('Transfer Between Accounts', () => {
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

  it('should post withdraw from source and deposit to target', async () => {
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

    // Select from account
    const fromSelect = await screen.findByRole('combobox', { name: /from account/i });
    await user.selectOptions(fromSelect, 'Savings');

    // Select to account
    const toSelect = await screen.findByRole('combobox', { name: /to account/i });
    await user.selectOptions(toSelect, 'BikeFund');

    // Enter amount
    const amountInput = await screen.findByRole('spinbutton', { name: /amount/i });
    await user.type(amountInput, '50');

    // Submit
    const submitButton = await screen.findByRole('button', { name: 'Transfer' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/transfer.*successful|completed/i)).toBeInTheDocument();
    });
  });

  it('should cap transfer amount to available balance with toast', async () => {
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
    await user.selectOptions(toSelect, 'BikeFund');

    const amountInput = await screen.findByRole('spinbutton', { name: /amount/i });
    await user.type(amountInput, '0');

    const submitButton = await screen.findByRole('button', { name: 'Transfer' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/valid amount greater than zero/i)).toBeInTheDocument();
    });
  });
});

