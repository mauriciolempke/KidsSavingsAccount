import { render, screen } from '@testing-library/react';
import Home from '../../src/app/page';
import { Providers } from '../../src/app/providers';
import { mockStore } from '../../setupTests';

describe('Dashboard - Empty State', () => {
  it('should show "[Parent Name] Bank" title and a hint to add a child when none exist', async () => {
    mockStore.set(
      'PARENT.txt',
      JSON.stringify({ name: 'Alex', children: [] })
    );

    render(
      <Providers>
        <Home />
      </Providers>
    );

    expect(await screen.findByText(/Alex's Bank/i)).toBeInTheDocument();
    expect(screen.getByText(/No Children Added Yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Get started by adding your first child to begin tracking their savings!/i)).toBeInTheDocument();
  });
});


