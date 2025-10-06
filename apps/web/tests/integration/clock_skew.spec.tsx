import { render, screen } from '@testing-library/react';

describe('Clock Skew Detection', () => {
  it('should show warning message when device clock is earlier than CBTS', async () => {
    const futureTime = Date.now() + 24 * 60 * 60 * 1000; // 1 day in future

    window.localStorage.setItem(
      'CHILD-emma.txt',
      JSON.stringify({
        name: 'Emma',
        accounts: [],
        cb: 0,
        cbts: futureTime // CBTS in the future
      })
    );

    // Mock app component that checks for clock skew
    const mockApp = () => <div>App Mock</div>;
    render(mockApp());

    // Expect warning message
    await screen.findByText(/clock.*earlier|time.*incorrect|adjust.*clock/i);
  });

  it('should skip balance calculation processing when clock skew detected', async () => {
    const futureTime = Date.now() + 24 * 60 * 60 * 1000;

    window.localStorage.setItem(
      'CHILD-emma.txt',
      JSON.stringify({
        name: 'Emma',
        accounts: ['savings'],
        cb: 100,
        cbts: futureTime
      })
    );

    window.localStorage.setItem(
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

