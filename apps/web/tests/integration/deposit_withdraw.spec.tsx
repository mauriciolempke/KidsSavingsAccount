import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockStore } from '../../setupTests';
import { Providers } from '../../src/app/providers';
import AccountView from '../../src/components/account/AccountView';


describe('Deposit and Withdraw', () => {
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
        accounts: ['savings'],
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
          { timestamp: Date.now() - 86400000, type: 'Deposit', description: 'Initial', value: 100 }
        ]
      })
    );
  });

  it('should append Deposit to ledger, run Balance Calculation, and update UI', async () => {
    const user = userEvent.setup();
    render(
      <Providers>
        <AccountView childName="emma" accountName="savings" />
      </Providers>
    );

    // Click Deposit button
    const depositButton = await screen.findByRole('button', { name: /deposit/i });
    await user.click(depositButton);

    // Fill in deposit form
    const amountInput = await screen.findByRole('spinbutton', { name: /amount/i });
    await user.type(amountInput, '25');

    const descInput = await screen.findByRole('textbox', { name: /description/i });
    await user.type(descInput, 'Chores');

    const submitButton = await screen.findByRole('button', { name: 'Deposit' });
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
    render(
      <Providers>
        <AccountView childName="emma" accountName="savings" />
      </Providers>
    );

    const withdrawButton = await screen.findByRole('button', { name: /withdraw/i });
    await user.click(withdrawButton);

    const amountInput = await screen.findByRole('spinbutton', { name: /amount/i });
    await user.type(amountInput, '30');

    const descInput = await screen.findByRole('textbox', { name: /description/i });
    await user.type(descInput, 'Toy purchase');

    const submitButton = await screen.findByRole('button', { name: 'Withdraw' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Toy purchase/i)).toBeInTheDocument();
    });

    // Expect balance to update (100 - 30 = 70)
    expect(screen.getByText(/\$70|Balance.*70/)).toBeInTheDocument();
  });

  it('should reject zero or negative amounts', async () => {
    const user = userEvent.setup();
    render(
      <Providers>
        <AccountView childName="emma" accountName="savings" />
      </Providers>
    );

    const depositButton = await screen.findByRole('button', { name: /deposit/i });
    await user.click(depositButton);

    const amountInput = await screen.findByRole('spinbutton', { name: /amount/i });
    await user.clear(amountInput);
    await user.type(amountInput, '0');

    const submitButton = await screen.findByRole('button', { name: 'Deposit' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/valid amount greater than zero/i)).toBeInTheDocument();
    });
  });
});

