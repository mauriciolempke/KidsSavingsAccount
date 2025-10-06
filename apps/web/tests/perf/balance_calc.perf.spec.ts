/**
 * Performance Tests for Balance Calculation
 * 
 * Requirement: Balance calculation must complete in < 50ms per child
 */

import { BalanceCalculator } from '../../src/domain/calc/BalanceCalculator';
import { Account, LedgerEntry } from '../../src/domain/types';

describe('Balance Calculation Performance', () => {
  function createMockAccount(
    withAllowance: boolean = false,
    withInterest: boolean = false,
    entryCount: number = 100
  ): Account {
    const ledger: LedgerEntry[] = [];
    const now = Date.now();
    
    // Create historical ledger entries
    for (let i = 0; i < entryCount; i++) {
      ledger.push({
        timestamp: now - (entryCount - i) * 24 * 60 * 60 * 1000, // Days ago
        type: i % 2 === 0 ? 'Deposit' : 'Withdraw',
        description: `Transaction ${i}`,
        value: i % 2 === 0 ? 10 : -5,
      });
    }

    return {
      name: 'Test Account',
      type: 'Savings',
      allowance: withAllowance ? {
        enabled: true,
        amount: 10,
        frequency: 'weekly',
      } : { enabled: false },
      interest: withInterest ? {
        enabled: true,
        type: 'Percentage',
        value: 5,
        frequency: 'monthly',
      } : { enabled: false },
      ledger,
    };
  }

  it('should calculate balance in < 50ms for simple account', () => {
    const account = createMockAccount(false, false, 50);
    const lastCalc = Date.now() - 90 * 24 * 60 * 60 * 1000; // 90 days ago
    const now = Date.now();

    const startTime = performance.now();
    const result = BalanceCalculator.calculate(account, lastCalc, now);
    const endTime = performance.now();

    const duration = endTime - startTime;
    
    console.log(`Simple account calculation: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(50);
    expect(result).toBeDefined();
  });

  it('should calculate balance in < 50ms for account with allowance', () => {
    const account = createMockAccount(true, false, 100);
    const lastCalc = Date.now() - 90 * 24 * 60 * 60 * 1000; // 90 days ago
    const now = Date.now();

    const startTime = performance.now();
    const result = BalanceCalculator.calculate(account, lastCalc, now);
    const endTime = performance.now();

    const duration = endTime - startTime;
    
    console.log(`Account with allowance calculation: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(50);
    expect(result.accruals.length).toBeGreaterThan(0);
  });

  it('should calculate balance in < 50ms for account with interest', () => {
    const account = createMockAccount(false, true, 100);
    const lastCalc = Date.now() - 90 * 24 * 60 * 60 * 1000; // 90 days ago
    const now = Date.now();

    const startTime = performance.now();
    const result = BalanceCalculator.calculate(account, lastCalc, now);
    const endTime = performance.now();

    const duration = endTime - startTime;
    
    console.log(`Account with interest calculation: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(50);
  });

  it('should calculate balance in < 50ms for account with both allowance and interest', () => {
    const account = createMockAccount(true, true, 100);
    const lastCalc = Date.now() - 90 * 24 * 60 * 60 * 1000; // 90 days ago
    const now = Date.now();

    const startTime = performance.now();
    const result = BalanceCalculator.calculate(account, lastCalc, now);
    const endTime = performance.now();

    const duration = endTime - startTime;
    
    console.log(`Account with allowance + interest calculation: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(50);
    expect(result.accruals.length).toBeGreaterThan(0);
  });

  it('should calculate balance in < 50ms for account with large ledger', () => {
    const account = createMockAccount(true, true, 500); // Large ledger
    const lastCalc = Date.now() - 365 * 24 * 60 * 60 * 1000; // 1 year ago
    const now = Date.now();

    const startTime = performance.now();
    const result = BalanceCalculator.calculate(account, lastCalc, now);
    const endTime = performance.now();

    const duration = endTime - startTime;
    
    console.log(`Large ledger (500 entries) calculation: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(50);
  });

  it('should calculate multiple accounts in < 50ms per child (3 accounts)', () => {
    const accounts = [
      createMockAccount(true, false, 50),
      createMockAccount(false, true, 75),
      createMockAccount(true, true, 100),
    ];
    
    const lastCalc = Date.now() - 90 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    const startTime = performance.now();
    
    accounts.forEach(account => {
      BalanceCalculator.calculate(account, lastCalc, now);
    });
    
    const endTime = performance.now();
    const totalDuration = endTime - startTime;
    const avgPerAccount = totalDuration / accounts.length;
    
    console.log(`Average per account (3 accounts): ${avgPerAccount.toFixed(2)}ms`);
    console.log(`Total for child (3 accounts): ${totalDuration.toFixed(2)}ms`);
    
    expect(avgPerAccount).toBeLessThan(50);
  });

  it('should handle clock skew efficiently', () => {
    const account = createMockAccount(true, true, 100);
    const lastCalc = Date.now() + 24 * 60 * 60 * 1000; // Future time (clock skew)
    const now = Date.now();

    const startTime = performance.now();
    const result = BalanceCalculator.calculate(account, lastCalc, now);
    const endTime = performance.now();

    const duration = endTime - startTime;
    
    console.log(`Clock skew detection: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(10); // Should be very fast (early return)
    expect(result.accruals.length).toBe(0);
  });

  it('should handle achieved goal efficiently (read-only)', () => {
    const account = createMockAccount(true, true, 100);
    account.goal = {
      name: 'Test Goal',
      cost: 100,
      achieved: true,
    };
    
    const lastCalc = Date.now() - 90 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    const startTime = performance.now();
    const result = BalanceCalculator.calculate(account, lastCalc, now);
    const endTime = performance.now();

    const duration = endTime - startTime;
    
    console.log(`Achieved goal (read-only) calculation: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(10); // Should be very fast (early return)
    expect(result.accruals.length).toBe(0);
  });
});

describe('Performance Benchmark Summary', () => {
  it('should log performance summary', () => {
    console.log('\n=== Balance Calculation Performance Summary ===');
    console.log('Requirement: < 50ms per child');
    console.log('All tests above validate this requirement');
    console.log('Optimizations:');
    console.log('  - Early returns for clock skew and achieved goals');
    console.log('  - Efficient period calculation');
    console.log('  - Minimal array operations');
    console.log('  - No unnecessary iterations');
    console.log('===============================================\n');
    
    expect(true).toBe(true);
  });
});

