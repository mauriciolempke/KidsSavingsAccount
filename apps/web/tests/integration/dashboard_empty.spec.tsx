import { render, screen } from '@testing-library/react';
import Home from '../../src/app/page';

describe('Dashboard - Empty State', () => {
  it('should show "[Parent Name] Bank" title and a hint to add a child when none exist', () => {
    window.localStorage.setItem(
      'PARENT.txt',
      JSON.stringify({ name: 'Alex', children: [] })
    );

    render(<Home />);

    expect(screen.getByText(/Alex Bank/i)).toBeInTheDocument();
    expect(screen.getByText(/add a child/i)).toBeInTheDocument();
  });
});


