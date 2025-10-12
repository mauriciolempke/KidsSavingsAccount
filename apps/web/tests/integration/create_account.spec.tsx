import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockStore } from '../../setupTests';
import { Providers } from '../../src/app/providers';
import ChildDashboard from '../../src/components/child/ChildDashboard';

describe('Create Account', () => {
  beforeEach(() => {
    mockStore.clear();
    mockStore.set(
      'PARENT.txt',
      JSON.stringify({ name: 'Alex', children: ['emma'] })
    );
    mockStore.set(
      'CHILD-emma.txt',
      JSON.stringify({
        name: 'Emma',
        accounts: [],
        cb: 0,
        cbts: Date.now()
      })
    );
  });

  it('should create a Savings account with allowance and interest configuration', async () => {
    const user = userEvent.setup();
    render(
      <Providers>
        <ChildDashboard childName="emma" />
      </Providers>
    );

    // Open add account form
    const addButton = await screen.findByRole('button', { name: /create.*account/i });
    await user.click(addButton);

    // Fill in account details
    const nameInput = await screen.findByRole('textbox', { name: /account name/i });
    await user.type(nameInput, 'Savings');

    // Select account type
    const typeSelect = await screen.findByRole('combobox', { name: /account type/i });
    await user.selectOptions(typeSelect, 'Savings');

    // Enable allowance
    const allowanceCheckbox = await screen.findByRole('checkbox', { name: /enable allowance/i });
    await user.click(allowanceCheckbox);

    const allowanceAmount = await screen.findByRole('spinbutton', { name: /allowance amount/i });
    await user.type(allowanceAmount, '10');

    const allowanceFreq = await screen.findByRole('combobox', { name: /allowance frequency/i });
    await user.selectOptions(allowanceFreq, 'weekly');

    // Submit
    const submitButton = await screen.findByRole('button', { name: 'Create Account' });
    await user.click(submitButton);

    // Wait for the account card to appear (it's a link to the account page)
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Savings/i })).toBeInTheDocument();
    });
  });

  it('should create a Goal account with goal name and cost', async () => {
    const user = userEvent.setup();
    render(
      <Providers>
        <ChildDashboard childName="emma" />
      </Providers>
    );

    const addButton = await screen.findByRole('button', { name: /Create First Account/i });
    await user.click(addButton);

    const nameInput = await screen.findByRole('textbox', { name: /account name/i });
    await user.type(nameInput, 'Bike Fund');

    const typeSelect = await screen.findByRole('combobox', { name: /account type/i });
    await user.selectOptions(typeSelect, 'Goal');

    // Fill in goal details
    const goalName = await screen.findByRole('textbox', { name: /goal name/i });
    await user.type(goalName, 'New Bike');

    const goalCost = await screen.findByRole('spinbutton', { name: /goal cost|target amount/i });
    await user.type(goalCost, '200');

    const submitButton = await screen.findByRole('button', { name: /Create Account/i });
    await user.click(submitButton);

    // Wait for the account card to appear (it's a link to the account page)
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Bike Fund/i })).toBeInTheDocument();
    });
  });
});

