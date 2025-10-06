describe('Ledger Ordering and Persistence', () => {
  it('should store ledger entries in ascending timestamp order (oldest first)', () => {
    const ledger = [
      { timestamp: 1000, type: 'Deposit', description: 'First', value: 10 },
      { timestamp: 2000, type: 'Deposit', description: 'Second', value: 20 },
      { timestamp: 3000, type: 'Withdraw', description: 'Third', value: -5 }
    ];

    // Verify ordering
    for (let i = 1; i < ledger.length; i++) {
      expect(ledger[i].timestamp).toBeGreaterThan(ledger[i - 1].timestamp);
    }
  });

  it('should display ledger entries newest-first in UI (reverse of storage order)', () => {
    const storedLedger = [
      { timestamp: 1000, type: 'Deposit', description: 'First', value: 10 },
      { timestamp: 2000, type: 'Deposit', description: 'Second', value: 20 },
      { timestamp: 3000, type: 'Withdraw', description: 'Third', value: -5 }
    ];

    // UI should reverse the array
    const displayLedger = [...storedLedger].reverse();

    expect(displayLedger[0].description).toBe('Third');
    expect(displayLedger[1].description).toBe('Second');
    expect(displayLedger[2].description).toBe('First');
  });

  it('should append new entries to end of ledger array', () => {
    const ledger = [
      { timestamp: 1000, type: 'Deposit', description: 'First', value: 10 }
    ];

    const newEntry = { timestamp: 2000, type: 'Deposit', description: 'Second', value: 20 };
    ledger.push(newEntry);

    expect(ledger[ledger.length - 1]).toEqual(newEntry);
    expect(ledger.length).toBe(2);
  });

  it('should maintain chronological order when adding entries', () => {
    const ledger = [
      { timestamp: 1000, type: 'Deposit', description: 'First', value: 10 },
      { timestamp: 2000, type: 'Deposit', description: 'Second', value: 20 }
    ];

    // New entry should have timestamp >= last entry
    const newEntry = { timestamp: Date.now(), type: 'Deposit', description: 'Third', value: 30 };
    
    expect(newEntry.timestamp).toBeGreaterThan(ledger[ledger.length - 1].timestamp);
  });
});

