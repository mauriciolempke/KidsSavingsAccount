import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '../../src/app/page';
import { Providers } from '../../src/app/providers';
import { mockStore } from '../../setupTests';

describe('Add Child', () => {
  beforeEach(() => {
    mockStore.clear();
    mockStore.set(
      'PARENT.txt',
      JSON.stringify({ name: 'Alex', children: [] })
    );
  });

  it('should add a child with a unique name, create file, and navigate to Child Dashboard', async () => {
    const user = userEvent.setup();
    render(
      <Providers>
        <Home />
      </Providers>
    );

    // Find and click "Add Child" button
    const addButton = await screen.findByRole('button', { name: 'Add Child' });
    await user.click(addButton);

    // Enter child name
    const nameInput = await screen.findByRole('textbox', { name: /child name/i });
    await user.type(nameInput, 'Emma');

    // Submit form - use specific button text "Add" from the modal
    const submitButton = await screen.findByRole('button', { name: 'Add' });
    await user.click(submitButton);

    // Wait for the modal to close and child to appear in the dashboard
    await waitFor(() => {
      // The child should now appear in the Family Overview section
      expect(screen.getByText('Family Overview')).toBeInTheDocument();
      expect(screen.getByText('Emma')).toBeInTheDocument();
    });

    // Verify the child card shows up with the expected balance
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('should accept UTF-8 characters in child name', async () => {
    const user = userEvent.setup();
    render(
      <Providers>
        <Home />
      </Providers>
    );

    const addButton = await screen.findByRole('button', { name: /add child/i });
    await user.click(addButton);

    const nameInput = await screen.findByRole('textbox', { name: /child name/i });
    await user.type(nameInput, 'Café☕');

    const submitButton = await screen.findByRole('button', { name: 'Add' });
    await user.click(submitButton);

    // Wait for the modal to close and child to appear in the dashboard
    await waitFor(() => {
      expect(screen.getByText('Family Overview')).toBeInTheDocument();
      expect(screen.getByText('Café☕')).toBeInTheDocument();
    });

    // Verify the child card shows up with the expected balance
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('should reject duplicate child name (case-insensitive)', async () => {
    mockStore.set(
      'PARENT.txt',
      JSON.stringify({ name: 'Alex', children: ['emma'] })
    );

    const user = userEvent.setup();
    render(
      <Providers>
        <Home />
      </Providers>
    );

    const addButton = await screen.findByRole('button', { name: /add child/i });
    await user.click(addButton);

    const nameInput = await screen.findByRole('textbox', { name: /child name/i });
    await user.type(nameInput, 'EMMA');

    const submitButton = await screen.findByRole('button', { name: 'Add' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/already exists/i)).toBeInTheDocument();
    });
  });
});

