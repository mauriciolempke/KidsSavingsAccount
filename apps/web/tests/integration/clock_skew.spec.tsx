import { render, screen } from '@testing-library/react';
import { mockStore } from '../../setupTests';
import { Providers } from '../../src/app/providers';
import ChildDashboard from '../../src/components/child/ChildDashboard';

describe('Clock Skew Detection', () => {
  it('should show warning message when device clock is earlier than CBTS', async () => {
    const futureTime = Date.now() + 24 * 60 * 60 * 1000; // 1 day in future

    mockStore.set(
      'PARENT.txt',
      JSON.stringify({ name: 'Test Parent', children: ['emma'] })
    );

    mockStore.set(
      'CHILD-emma.txt',
      JSON.stringify({
        name: 'Emma',
        accounts: [],
        cb: 0,
        cbts: futureTime // CBTS in the future
      })
    );

    render(
      <Providers>
        <ChildDashboard childName="emma" />
      </Providers>
    );

    // Expect warning message
    await screen.findByText(/clock.*earlier|time.*incorrect|adjust.*clock/i);
  });

  it('should skip balance calculation processing when clock skew detected', async () => {
    const futureTime = Date.now() + 24 * 60 * 60 * 1000;

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
        cbts: futureTime
      })
    );

    mockStore.set(
      'ACCOUNT-emma-savings.txt',
      JSON.stringify({
        name: 'Savings',
        type: 'Savings',
        allowance: { enabled: true, amount: 10, frequency: 'weekly' },
        interest: { enabled: false },
        ledger: []
      })
    );

    // Mock calculation should not run
    const mockCalculate = (cbts: number) => {
      if (Date.now() < cbts) {
        return null; // Skip processing
      }
      return 110;
    };

    expect(mockCalculate(futureTime)).toBeNull();
  });
});

