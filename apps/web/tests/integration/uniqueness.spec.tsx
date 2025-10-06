import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Name Uniqueness Validation', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem(
      'PARENT.txt',
      JSON.stringify({ name: 'Alex', children: ['emma'] })
    );
    window.localStorage.setItem(
      'CHILD-emma.txt',
      JSON.stringify({
        name: 'Emma',
        accounts: ['savings'],
        cb: 0,
        cbts: Date.now()
      })
    );
  });

  it('should reject duplicate child names (case-insensitive)', async () => {
    const user = userEvent.setup();
    const mockDashboard = () => <div>Dashboard Mock</div>;
    render(mockDashboard());

    const addChildButton = await screen.findByRole('button', { name: /add child/i });
    await user.click(addChildButton);

    const nameInput = await screen.findByRole('textbox', { name: /child name/i });
    await user.type(nameInput, 'EMMA'); // Different case

    const submitButton = await screen.findByRole('button', { name: /create|add/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/already exists|duplicate name/i)).toBeInTheDocument();
    });
  });

  it('should reject duplicate account names within same child (case-insensitive)', async () => {
    const user = userEvent.setup();
    const mockChildDashboard = () => <div>Child Dashboard Mock</div>;
    render(mockChildDashboard());

    const addAccountButton = await screen.findByRole('button', { name: /add account/i });
    await user.click(addAccountButton);

    const nameInput = await screen.findByRole('textbox', { name: /account name/i });
    await user.type(nameInput, 'SAVINGS'); // Different case

    const typeSelect = await screen.findByRole('combobox', { name: /account type/i });
    await user.selectOptions(typeSelect, 'Savings');

    const submitButton = await screen.findByRole('button', { name: /create|save/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/already exists|duplicate name/i)).toBeInTheDocument();
    });
  });

  it('should allow same account name across different children', async () => {
    window.localStorage.setItem(
      'PARENT.txt',
      JSON.stringify({ name: 'Alex', children: ['emma', 'noah'] })
    );
    window.localStorage.setItem(
      'CHILD-noah.txt',
      JSON.stringify({
        name: 'Noah',
        accounts: [],
        cb: 0,
        cbts: Date.now()
      })
    );

    // Noah can have a 'Savings' account even though Emma has one
    const user = userEvent.setup();
    const mockChildDashboard = () => <div>Noah Dashboard Mock</div>;
    render(mockChildDashboard());

    const addAccountButton = await screen.findByRole('button', { name: /add account/i });
    await user.click(addAccountButton);

    const nameInput = await screen.findByRole('textbox', { name: /account name/i });
    await user.type(nameInput, 'Savings');

    const typeSelect = await screen.findByRole('combobox', { name: /account type/i });
    await user.selectOptions(typeSelect, 'Savings');

    const submitButton = await screen.findByRole('button', { name: /create|save/i });
    await user.click(submitButton);

    // Should succeed
    await waitFor(() => {
      expect(screen.queryByText(/already exists|duplicate name/i)).not.toBeInTheDocument();
    });
  });
});

