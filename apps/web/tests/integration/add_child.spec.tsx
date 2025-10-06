import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '../../src/app/page';

describe('Add Child', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem(
      'PARENT.txt',
      JSON.stringify({ name: 'Alex', children: [] })
    );
  });

  it('should add a child with a unique name, create file, and navigate to Child Dashboard', async () => {
    const user = userEvent.setup();
    render(<Home />);

    // Find and click "Add Child" button
    const addButton = await screen.findByRole('button', { name: /add child/i });
    await user.click(addButton);

    // Enter child name
    const nameInput = await screen.findByRole('textbox', { name: /child name/i });
    await user.type(nameInput, 'Emma');

    // Submit form
    const submitButton = await screen.findByRole('button', { name: /create|add|save/i });
    await user.click(submitButton);

    // Expect navigation to Child Dashboard
    await waitFor(() => {
      expect(screen.getByText(/Emma's Accounts/i)).toBeInTheDocument();
    });
  });

  it('should accept UTF-8 characters in child name', async () => {
    const user = userEvent.setup();
    render(<Home />);

    const addButton = await screen.findByRole('button', { name: /add child/i });
    await user.click(addButton);

    const nameInput = await screen.findByRole('textbox', { name: /child name/i });
    await user.type(nameInput, 'Café☕');

    const submitButton = await screen.findByRole('button', { name: /create|add|save/i });
    await user.click(submitButton);

    // Expect successful creation with UTF-8 name
    await waitFor(() => {
      expect(screen.getByText(/Café☕/i)).toBeInTheDocument();
    });
  });

  it('should reject duplicate child name (case-insensitive)', async () => {
    window.localStorage.setItem(
      'PARENT.txt',
      JSON.stringify({ name: 'Alex', children: ['emma'] })
    );

    const user = userEvent.setup();
    render(<Home />);

    const addButton = await screen.findByRole('button', { name: /add child/i });
    await user.click(addButton);

    const nameInput = await screen.findByRole('textbox', { name: /child name/i });
    await user.type(nameInput, 'EMMA');

    const submitButton = await screen.findByRole('button', { name: /create|add|save/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/already exists/i)).toBeInTheDocument();
    });
  });
});

