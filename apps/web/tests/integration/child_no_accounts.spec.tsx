import { render, screen } from '@testing-library/react';
import { mockStore } from '../../setupTests';
import { Providers } from '../../src/app/providers';
import ChildDashboard from '../../src/components/child/ChildDashboard';

describe('Child Dashboard - No Accounts', () => {
  it('should display guidance to add an account when child has no accounts', async () => {
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

    render(
      <Providers>
        <ChildDashboard childName="emma" />
      </Providers>
    );

    // Expect guidance text
    expect(await screen.findByText(/No Accounts Yet/i)).toBeInTheDocument();
    expect(await screen.findByText(/Create your first account to start saving!/i)).toBeInTheDocument();
  });
});

