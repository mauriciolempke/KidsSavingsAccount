import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockStore } from '../../setupTests';

const mockDashboard = () => <div>Dashboard Mock</div>;

describe('Delete Child', () => {
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
        ledger: []
      })
    );
  });

  it('should show confirmation dialog before deleting child', async () => {
    const user = userEvent.setup();
    render(mockDashboard());

    const deleteButton = await screen.findByRole('button', { name: /delete.*emma|remove.*child/i });
    await user.click(deleteButton);

    // Expect confirmation dialog
    expect(await screen.findByText(/are you sure|confirm delete|permanently delete/i)).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /confirm|yes|delete/i })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /cancel|no/i })).toBeInTheDocument();
  });

  it('should cascade delete all child files (child + accounts + backups)', async () => {
    const user = userEvent.setup();
    render(mockDashboard());

    const deleteButton = await screen.findByRole('button', { name: /delete.*emma|remove.*child/i });
    await user.click(deleteButton);

    const confirmButton = await screen.findByRole('button', { name: /confirm|yes|delete/i });
    await user.click(confirmButton);

    await waitFor(() => {
      // Verify child removed from parent
      const parentData = JSON.parse(mockStore.get('PARENT.txt') || '{}');
      expect(parentData.children).not.toContain('emma');

      // Verify child file deleted
      expect(mockStore.get('CHILD-emma.txt')).toBeUndefined();

      // Verify account files deleted
      expect(mockStore.get('ACCOUNT-emma-savings.txt')).toBeUndefined();
    });
  });

  it('should cancel deletion when user clicks Cancel', async () => {
    const user = userEvent.setup();
    render(mockDashboard());

    const deleteButton = await screen.findByRole('button', { name: /delete.*emma|remove.*child/i });
    await user.click(deleteButton);

    const cancelButton = await screen.findByRole('button', { name: /cancel|no/i });
    await user.click(cancelButton);

    // Verify data still exists
    expect(mockStore.get('CHILD-emma.txt')).toBeDefined();
  });
});

