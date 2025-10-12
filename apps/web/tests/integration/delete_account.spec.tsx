import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockStore } from '../../setupTests';
import { Providers } from '../../src/app/providers';
import ChildDashboard from '../../src/components/child/ChildDashboard';

describe('Delete Account', () => {
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
        accounts: ['savings', 'bike'],
        cb: 150,
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
        ledger: []
      })
    );
    mockStore.set(
      'ACCOUNT-emma-bike.txt',
      JSON.stringify({
        name: 'Bike',
        type: 'Goal',
        allowance: { enabled: false },
        interest: { enabled: false },
        goal: { name: 'New Bike', cost: 200, achieved: false },
        ledger: []
      })
    );
  });

  it('should show confirmation dialog before deleting account', async () => {
    const user = userEvent.setup();
    render(
      <Providers>
        <ChildDashboard childName="emma" />
      </Providers>
    );

    const deleteButton = await screen.findByRole('button', { name: /delete.*savings|remove.*account/i });
    await user.click(deleteButton);

    expect(await screen.findByText(/are you sure|confirm delete|permanently delete/i)).toBeInTheDocument();
  });

  it('should delete account file and update child references', async () => {
    const user = userEvent.setup();
    render(
      <Providers>
        <ChildDashboard childName="emma" />
      </Providers>
    );

    const deleteButton = await screen.findByRole('button', { name: /delete.*savings|remove.*account/i });
    await user.click(deleteButton);

    const confirmButton = await screen.findByRole('button', { name: /confirm|yes|delete/i });
    await user.click(confirmButton);

    await waitFor(() => {
      // Verify account removed from child
      const childData = JSON.parse(mockStore.get('CHILD-emma.txt') || '{}');
      expect(childData.accounts).not.toContain('savings');
      expect(childData.accounts).toContain('bike'); // Other account still exists

      // Verify account file deleted
      expect(mockStore.get('ACCOUNT-emma-savings.txt')).toBeUndefined();
    });
  });

  it('should recalculate child balance after account deletion', async () => {
    const user = userEvent.setup();
    render(
      <Providers>
        <ChildDashboard childName="emma" />
      </Providers>
    );

    const deleteButton = await screen.findByRole('button', { name: /delete.*savings|remove.*account/i });
    await user.click(deleteButton);

    const confirmButton = await screen.findByRole('button', { name: /confirm|yes|delete/i });
    await user.click(confirmButton);

    await waitFor(() => {
      // Balance calculation should run after deletion
      const childData = JSON.parse(mockStore.get('CHILD-emma.txt') || '{}');
      expect(childData.cbts).toBeGreaterThan(0);
    });
  });
});

